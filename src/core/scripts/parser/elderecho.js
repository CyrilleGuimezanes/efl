window.parsers = window.parsers || {};
/**
 * Parse data received for services
 * @param  {Text} data HTML/JSON
 * @return {Array}      List of parsed elements
 */
window.parsers["elderecho"] = function(data, params){
  return {
    results: [],
    credential: {}
  }
}
