import counterModel from '../models/counter.model.js';

// Function to get the next UHID
export async function getNextUHID() {
    const initialValue = 100000; // Starting value for UHID

    const result = await counterModel.findByIdAndUpdate(
        { _id: 'uhid' },                       // Track the UHID sequence under the _id 'uhid'
        { $inc: { sequence_value: 1 } },       // Increment the UHID by 1
        { 
            new: true,                         // Return the new value after increment
            upsert: true,                      // If 'uhid' document does not exist, create it
            setDefaultsOnInsert: true          // Set default value if the document is created
        }
    );

    // If this is the first entry, set the initial value
    if (result.sequence_value === 1) {
        // Update it to start from the initial value
        await counterModel.findByIdAndUpdate(
            { _id: 'uhid' },
            { $set: { sequence_value: initialValue } }
        );
        return initialValue; // Return the starting UHID
    }

    return result.sequence_value; // Return the updated UHID
}
