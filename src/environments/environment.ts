// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  logo: '../../assets/img/boda-logo.png',
  csvFile: '../../assets/files/customer tempate.csv',
  vnPath: '/assets/media',
  env: 'lo',
  api: `http://localhost:10484/api-z/`,
  api_1: `https://smartcityapi.bodacommunity.io:8080/api-1/`,
  // _api: `http://localhost:10484`,
  _api: `https://delivery-db.herokuapp.com`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
