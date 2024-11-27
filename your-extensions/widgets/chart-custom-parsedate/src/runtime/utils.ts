
//Format date to type parse dates
export const formatYear = (timestamp: string) => {
  const date = new Date(timestamp)
  // return date.getFullYear().toString()
  return date.getFullYear()
}

export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  // return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`
  return date
}

export const formatMonth = (timestamp: string) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth()
  return new Date(year, month, 1)
}

export const getUpdatedColoursList = (colorMap, codeList) => {
    return Object.keys(colorMap).reduce((result, code) => {
        const matchedItem = codeList.find(item => item.code == code);
        if (matchedItem) {
            result[matchedItem.name] = colorMap[code];
        }
        return result;
    }, {});
};
