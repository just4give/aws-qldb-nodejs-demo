const ionjs = require("ion-js");

function getFieldValue(ionReader, path) {
    ionReader.next();
    ionReader.stepIn();
    return recursivePathLookup(ionReader, path);
}
function recursivePathLookup(ionReader, path) {
    
    if (path.length === 0) {
        
        // If the path's length is 0, the current ionReader node is the value which should be returned.
        if (ionReader.type() === ionjs.IonTypes.LIST  ) {
            const list = [];
            ionReader.stepIn(); // Step into the list.
            while (ionReader.next() != null) {
                const itemInList = recursivePathLookup(ionReader, []);
                list.push(itemInList);
            }

            return list;
        } else if (ionReader.type() === ionjs.IonTypes.STRUCT) {
            const structToReturn = {};

            let type;
            const currentDepth = ionReader.depth();
            ionReader.stepIn();
            while (ionReader.depth() > currentDepth) {
                // In order to get all values within the struct, we need to visit every node.
                type = ionReader.next();
                if (type === null) {
                    // End of the container indicates that we need to step out.
                    ionReader.stepOut();
                } else {
                    structToReturn[ionReader.fieldName()] = recursivePathLookup(ionReader, []);
                }
            }
            return structToReturn;
        }
        return ionReader.value();
    } else if (path.length === 1) {
        // If the path's length is 1, the single value in the path list is the field should to be returned.

        while (ionReader.next() != null) {
            if (ionReader.fieldName() === path[0]) {
                path.shift(); // Remove the path node which we just entered.
                return recursivePathLookup(ionReader, path);
            }
        }
    } else {
        // If the path's length >= 2, the Ion tree needs to be traversed more to find the value we're looking for.

        while (ionReader.next() != null) {

            if (ionReader.fieldName() === path[0]) {
                ionReader.stepIn(); // Step into the IonStruct.
                path.shift(); // Remove the path node which we just entered.
                return recursivePathLookup(ionReader, path);
            }
        }
    }
    // If the path doesn't exist, return undefined.
    return undefined;
}

function writeValueAsIon(value, ionWriter) {
    switch (typeof value) {
        case "string":
            ionWriter.writeString(value);
            break;
        case "boolean":
            ionWriter.writeBoolean(value);
            break;
        case "number":
            ionWriter.writeInt(value);
            break;
        case "object":
            if (Array.isArray(value)) {
                // Object is an array.
                ionWriter.stepIn(ion_js_1.IonTypes.LIST);
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var element = value_1[_i];
                    writeValueAsIon(element, ionWriter);
                }
                ionWriter.stepOut();
            }
            else if (value instanceof Date) {
                // Object is a Date.
                ionWriter.writeTimestamp(ion_js_1.Timestamp.parse(value.toISOString()));
            }
            else if (value instanceof ion_js_1.Decimal) {
                // Object is a Decimal.
                ionWriter.writeDecimal(value);
            }
            else if (value === null) {
                ionWriter.writeNull(ion_js_1.IonTypes.NULL);
            }
            else {
                // Object is a struct.
                ionWriter.stepIn(ion_js_1.IonTypes.STRUCT);
                for (var _a = 0, _b = Object.keys(value); _a < _b.length; _a++) {
                    var key = _b[_a];
                    ionWriter.writeFieldName(key);
                    writeValueAsIon(value[key], ionWriter);
                }
                ionWriter.stepOut();
            }
            break;
        default:
            throw new Error("Cannot convert to Ion for type: " + (typeof value) + ".");
    }
}

exports.getFieldValue =getFieldValue;
exports.recursivePathLookup =recursivePathLookup;
exports.writeValueAsIon = writeValueAsIon;
