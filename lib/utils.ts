export const capitalizeAndCompressString = (string: string) => {
  const rString = string.split(" ");
  const rStringCap = rString.map((s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  })
  const compressedString = rStringCap.join('');
  // logDebug({compressedString});
  return compressedString
}

export const capitalizeAndUnderscoreString = (string: string) => {
  const rString = string.split(" ");
  const rStringCap = rString.map((s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  })
  const underscoredString = rStringCap.join('_');
  // logDebug({underscoredString});
  return underscoredString
}

export const uppercaseAndCompressString = (string: string) => {
  const rString = string.split(" ");
  const rStringUpper = rString.map((s) => {
    return s.toUpperCase();
  })
  const compressedString = rStringUpper.join('');
  // logDebug({compressedString});
  return compressedString
}

export const nullPromise = async () => {
  return Promise.resolve(null);
}

export const getQueryStr = (params: any) => {
  const queryArr = Object.keys(params).map((key: string) => {
    return `${key}=${params[key]}`
  });
  return queryArr.join('&');
}

export const showTimeStamp = () => {
  console.log('\n|--------------------------------------------------------------|');
  console.log('|- ' + Date() + ' -|');
  console.log('|--------------------------------------------------------------|\n');
}