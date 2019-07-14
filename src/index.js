
const {get, isObject, isDate} = require('lodash');

const mor = {
    name: 'mor',
    modes: ['a','b','c','d'],
};
mor.data = mor;

const problematicObject = {
  firstProp: [
     [
       'part', new Date(), mor
     ],
     mor
  ]
};
problematicObject.secondProp = problematicObject.firstProp;

const getPathValue = (obj, path) => path.length ? get(obj, path) : obj;

const getAllValuesInPath = (obj, path) =>
    path.map((key, index) => getPathValue(obj, path.filter((x, i) => i <= index)));

const isValueContainedInPath = (obj, value, path) =>
    getAllValuesInPath(obj, path).includes(value);

const getPathString = path => path.map(key => `[${key}]`).join('');

const isPathScanned = (path, scannedPaths) =>
    scannedPaths.map(getPathString).includes(getPathString(path));

const getCircularPathMessage = currentValuePath => `CIRCULAR => object${getPathString(currentValuePath)}`;

const getRelativeParentPath = (obj, currentParentPath, currentKey, currentValue, scannedPaths) => {
    /*const newParentPath = [...currentParentPath];
    let currentObjectPath, pathValue, isValueDate, comparablePathValue, comparableValue;

    const setHelpers = () => {
        currentObjectPath = [...newParentPath, currentKey];
        pathValue = getPathValue(obj, currentObjectPath);
        isValueDate = isDate(pathValue);
        comparablePathValue = isValueDate ?
            pathValue.getTime() :
            pathValue;

        comparableValue = isValueDate ?
            new Date(currentValue).getTime() :
            currentValue;
    };*/

    return currentParentPath.reduce(path => {
        const childPath = [...path, currentKey];
        const childPathValue = getPathValue(obj, childPath);

        const comparableChildPathValue = isDate(childPathValue) ?
            childPathValue.getTime() :
            childPathValue;

        const comparableCurrentValue = isDate(childPathValue) ?
            new Date(currentValue).getTime() :
            currentValue;

        if (comparableChildPathValue !== comparableCurrentValue ||
            isPathScanned(childPath, scannedPaths)) {
            return path.slice(0, -1);
        }

        return path;
    }, [...currentParentPath]);

    /*setHelpers();

    while (comparablePathValue !== comparableValue ||
           isPathScanned(currentObjectPath, scannedPaths)) {
        newParentPath.splice(-1);
        setHelpers();
    }

    return newParentPath;*/
};

const updateParentPath = (obj, currentParentPath, currentKey, currentValue, scannedPaths) => {
    const newParentPath = getRelativeParentPath(obj, currentParentPath, currentKey, currentValue, scannedPaths);

    currentParentPath.splice(0, currentParentPath.length);
    currentParentPath.push(...newParentPath);
};

const stringifyWithCircles = obj => {
    const parentPath = [];
    const scannedPaths = [];

    const replacer = (key, value) => {
        // Only the Root object (no key) is allowed to skip the logic!!
        if (!key) {
            return value;
        }

        updateParentPath(obj, parentPath, key, value, scannedPaths);

        const valuePath = [...parentPath, key];
        scannedPaths.push(valuePath);

        const isCircular = isValueContainedInPath(obj, value, parentPath);

        // The parentPath will now contain also the child.
        // We are assuming the next iteration of the "Stringify" recursion
        // will scan a child object.
        // If it is not the case, the "getRelativeParentPath" would roll
        // the path upwards until finding the current path
        parentPath.push(key);

        return isObject(value) && isCircular ?
            getCircularPathMessage(valuePath) :
            value;
    };

    return JSON.stringify(obj, replacer);
};

console.log(stringifyWithCircles(problematicObject));