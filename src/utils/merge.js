/**
 * Smart merge function that intelligently combines two objects
 * Only overwrites fields in original if the new value is meaningful (not null, undefined, empty string)
 * @param {Object} original - The original object with existing data
 * @param {Object} update - The update object with new data
 * @returns {Object} Merged object preserving meaningful values
 */
export const smartMerge = (original, update) => {
  if (!original) return update || {};
  if (!update) return original;

  const merged = { ...original };

  Object.keys(update).forEach((key) => {
    const updateValue = update[key];

    // Only use update value if it's meaningful
    if (
      updateValue !== null &&
      updateValue !== undefined &&
      updateValue !== "" &&
      !(Array.isArray(updateValue) && updateValue.length === 0)
    ) {
      merged[key] = updateValue;
    }
    // Keep original value if update value is not meaningful and original has a value
    // This preserves existing data when API returns null/undefined
  });

  return merged;
};

/**
 * Deep smart merge for nested objects
 * @param {Object} original - The original object with existing data
 * @param {Object} update - The update object with new data
 * @returns {Object} Deep merged object preserving meaningful values
 */
export const deepSmartMerge = (original, update) => {
  if (!original) return update || {};
  if (!update) return original;

  const merged = { ...original };

  Object.keys(update).forEach((key) => {
    const updateValue = update[key];
    const originalValue = original[key];

    // Handle nested objects
    if (
      updateValue &&
      typeof updateValue === "object" &&
      !Array.isArray(updateValue) &&
      originalValue &&
      typeof originalValue === "object" &&
      !Array.isArray(originalValue)
    ) {
      merged[key] = deepSmartMerge(originalValue, updateValue);
    }
    // Only use update value if it's meaningful
    else if (
      updateValue !== null &&
      updateValue !== undefined &&
      updateValue !== "" &&
      !(Array.isArray(updateValue) && updateValue.length === 0)
    ) {
      merged[key] = updateValue;
    }
    // Keep original value if update value is not meaningful
  });

  return merged;
};
