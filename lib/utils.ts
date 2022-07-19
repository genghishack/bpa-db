export const capitalizeAndCompressString = (
  string: string,
) => {
  const rString = string.split(" ");
  const rStringCap = rString.map((s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  })
  const compressedString = rStringCap.join('');
  // log.debug({compressedString});
  return compressedString
}

export const capitalizeStringWithUrlEntities = (
  string: string,
) => {
  const rString = string.split(" ");
  const rStringCap = rString.map((s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  })
  const convertedString = rStringCap.join('%20');
  // log.debug({convertedString});
  return convertedString
}

export const capitalizeAndUnderscoreString = (
  string: string,
) => {
  const rString = string.split(" ");
  const rStringCap = rString.map((s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  })
  const underscoredString = rStringCap.join('_');
  // log.debug({underscoredString});
  return underscoredString
}

export const uppercaseAndCompressString = (
  string: string,
) => {
  const rString = string.split(" ");
  const rStringUpper = rString.map((s: string) => {
    return s.toUpperCase();
  })
  const compressedString = rStringUpper.join('');
  // log.debug({compressedString});
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

export const getDateStamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return [year, month, day].join('');
}