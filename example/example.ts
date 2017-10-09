/*
This example is just with the documentation, and not with actual effects and actions
 */

/**
 * @type Effect
 * @name fetchData$
 * @ofType FetchDataAction
 * @action FetchDataSuccessAction?, FetchDataFailureAction?
 **/

/**
 * @type Effect
 * @name fetchDataClientError$
 * @ofType FetchDataFailureAction
 * @filter If error is 4xx (Client)
 * @action ToastAction
 **/

/**
 * @type Effect
 * @name fetchDataServerError$
 * @ofType FetchDataFailureAction
 * @filter If error is 5xx (Server)
 * @action ToastAction
 **/

/**
 * @type Effect
 * @name fetchDataSuccess$
 * @ofType FetchDataSuccessAction
 * @action UpdateViewAction, ToastAction
 **/

/**
 * @type Effect
 * @name fetchDataSuccessSetPin$
 * @ofType FetchDataSuccessAction
 * @filter If in pinning mode
 * @action SetPinAction
 **/
