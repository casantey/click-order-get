import * as dayjs from "dayjs";

// var newFormat = require("dayjs/plugin/advancedFormat");

import * as newFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(newFormat);

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = dayjs(dateString);
  return date.format("Do MMMM, YYYY");
}

export function setDate(dateString) {
  if (!dateString) return "";
  const date = dayjs(dateString);
  return date.format("YYYY-MM-DD");
}

export function dateTime(dateString) {
  if (!dateString) return "";
  const date = dayjs(dateString);
  return date.format("Do MMMM, YYYY hh:mma");
}

export function getTime(dateString) {
  if (!dateString) return "";
  const date = dayjs(dateString);
  return date.format("hh:mm a");
}

export const currentDate = dayjs().format("YYYY-MM-DD");
export const fullCurrentDate = dayjs().format("Do MMMM, YYYY");
export const monthYear = dayjs().format("MMMM YYYY");
export const minMonthYear = dayjs().format("YYYY/MM");

//Visit https://day.js.org/en/ for documentation
