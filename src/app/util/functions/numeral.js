import numeral from "numeral";

export function formatNumber(value) {
  return numeral(value).format("0,0[.]0000");
}

export function formatWholeNumber(value) {
  return numeral(value).format("0,0");
}

export function formatDecimal(value) {
  return numeral(value).format("0,0.00");
}

// export function formatNumber(value) {
//   // return numeral(value).format("0,0.00");
//   if (!value) return 0.0;
//   // Intercept the value and keep two decimal places
//   // let val = value.toFixed(2)
//   // Get the integer part
//   const intPart = Math.trunc(value);
//   // integer part processing, increase,
//   const intPartFormat = intPart
//     .toString()
//     .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
//   // Predefined decimal part
//   let floatPart = ".00";
//   // Cut the value into decimal part and integer part
//   const valueArray = value.toString().split(".");
//   if (valueArray.length === 2) {
//     // has a decimal part
//     floatPart = valueArray[1].toString(); // Get the decimal part
//     return intPartFormat + "." + floatPart;
//   }
//   return intPartFormat + floatPart;
// }
