// CustomJS: Tap callback for the state map
//
// Provided arguments:
// args={      'event':ev,
//             'mpoly':mpoly,
//             'ext_datafiles': ext_datafiles,
//             'source_map': source_map,
//             'p_map':p_map,
// ),
// Interprete and respond
var ind = mpoly.data_source.selected.indices
var location = 'None'
var filename_data = ''
var filename_map = ''
var hash = ''
// Get other models/tooltips
const p_statesmap_mpoly = window.Bokeh.documents[0].get_model_by_name('p_statesmap_mpoly')
const main_colorbar = window.Bokeh.documents[0].get_model_by_name('main_colorbar')
const button_continental_us_only = window.Bokeh.documents[0].get_model_by_name('button_continental_us_only')
const radioGroup_level_select = window.Bokeh.documents[0].get_model_by_name('radioGroup_level_select')
const checkbox_group = window.Bokeh.documents[0].get_model_by_name('checkbox_group')
// const span_play_position = window.Bokeh.documents[0].get_model_by_name('span_play_position')
const date_range_slider = window.Bokeh.documents[0].get_model_by_name('date_range_slider')
const spinner_minStepTime = window.Bokeh.documents[0].get_model_by_name('spinner_minStepTime')
const radioGroup_play_controls = window.Bokeh.documents[0].get_model_by_name('radioGroup_play_controls')
// const button_toggle_states_outline = window.Bokeh.documents[0].get_model_by_name('button_toggle_states_outline')
const play_controls = {
  'play': 0,
  'step': 1,
  'pause': 2,
}

switch (event) {

  case 'checkbox_group':
    // Make indices for all the boxes then check every one.
    var box_numbers = [...Array(checkbox_group.labels.length).keys()] 
    // console.log(box_numbers)
    // console.log(p_map.toolbar)
    for (const n of box_numbers) {
      // console.log(checkbox_group.labels[n])
      if (checkbox_group.active.includes(n)){
        // Box is checked
        switch (checkbox_group.labels[n]){
          case 'State Outlines':
            p_statesmap_mpoly.visible = true;
            break;
          case 'Toolbar':
            p_map.toolbar.autohide = false
            break;  
          case 'ColorBar':
            main_colorbar.visible = true
            break;
          case 'Play Speed':
            spinner_minStepTime.visible = true;
            break;
        }
      }
      else{
        // Box is not checked
        switch (checkbox_group.labels[n]){
          case 'State Outlines':
            p_statesmap_mpoly.visible = false;
            break;
          case 'Toolbar':
            p_map.toolbar.autohide = true
            break;  
          case 'ColorBar':
            main_colorbar.visible = false
            break;
          case 'Play Speed':
              spinner_minStepTime.visible = false;
              break;
        }
      }
    }
     
    break;


  case 'date_range_slider_throttled':
      var start_date = new Date(date_range_slider.value[0])
      var end_date = new Date(date_range_slider.value[1])
      // Subtract one day so that the map can be updated with step
      start_date.setDate(start_date.getDate()-1);
      date_range_slider.value[0] = start_date.getTime();
      // span_play_position.location = day.getTime();
  
      switch (radioGroup_play_controls.active) {
        case play_controls.step:
          radioGroup_play_controls.active = play_controls.pause;
          break;
        case play_controls.play:
        case play_controls.pause:
          break;
      }
      // Step to refresh map
      radioGroup_play_controls.active = play_controls.step;  

  case 'date_range_slider':
    var start_date = new Date(date_range_slider.value[0])
    var end_date = new Date(date_range_slider.value[1])
    // span_play_position.location = day.getTime();

    switch (radioGroup_play_controls.active) {
      case play_controls.step:
        radioGroup_play_controls.active = play_controls.pause;
        break;
      case play_controls.play:
      case play_controls.pause:
        break;
    }

    // No break from date_range_slider, directly into radioGroup_play_controls
    case 'radioGroup_play_controls':
      switch (radioGroup_play_controls.active) {
        case play_controls.pause:
          date_range_slider.disabled = false;
          break;
        case play_controls.step:
        case play_controls.play:
          date_range_slider.disabled = true;
          var start_date = new Date(date_range_slider.value[0])
          var end_date = new Date(date_range_slider.value[1])
          var day = start_date;

          var date_format_options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
          };
          var date_format_options2 = {
            weekday: 'long',
            timeZone: 'UTC'
          };
          // Including UTC as the timezone is important
          var day_str = day.toLocaleDateString("en-US", date_format_options) + ", " + day.toLocaleDateString("en-US", date_format_options2)

          var next_day = new Date(day)
          next_day.setDate(next_day.getDate() + 1)


          // Find all locations on the map
          var locations = mpoly.data_source.data['location']
          var cnt = 0
          var t0 = performance.now()
          
          // Load data for each location, and update the map with the data for the given date
          //for (const [n, loc] of locations.entries()) 
          
          const sel_date = find_in_sorted_array(day.getTime()*1e6, ext_datafiles['date_to_filename']['dates'])
          {
              readJSONgz_fun(ext_datafiles['rel_path'] + ext_datafiles['date_to_filename'][sel_date['value'].toString()] + '.json.gz', function() {
              var data = JSON.parse(pako.inflate(this.response, {
                to: 'string'
              }));
              // data['data'] = rep_nan_code(data['data'], data['nan_code'])
              // data['data'] = correct_date_format(data['data'])

              // Load data for each location, and update the map with the data for the given date
              for (const [n, loc] of locations.entries()) {
                if (loc in data['data']){
                  for (const k in mpoly.data_source.data) {
                    if (k in data['data'][loc]) {
                      mpoly.data_source.data[k][n] = data['data'][loc][k]
                    }
                  }
                }
              }
              mpoly.data_source.data = rep_nan_code(mpoly.data_source.data, data['nan_code'])

              // Update the map data with the data for the selected date
              // for (const k in mpoly.data_source.data) {
              //   if (k in data['data']) {
              //     mpoly.data_source.data[k][n] = data['data'][k][sel_date['index']]
              //   }
              // }

              cnt += 1
              // if (cnt >= locations.length) 
              {
                // Finished updating map, set map title
                p_map.title.text = day_str;
                mpoly.data_source.change.emit()

                // Finish up step and ready for next, when minimum time elapsed
                var dt = performance.now() - t0
                setTimeout(function() {
                  // Update DateRangeSlider and play controls
                  if (next_day.getTime() > end_date.getTime()) {
                    date_range_slider.value = [end_date.getTime(), end_date.getTime()];
                    radioGroup_play_controls.active = play_controls.pause;
                  } else {
                    date_range_slider.value = [next_day.getTime(), end_date.getTime()];
                  }
                  date_range_slider.change.emit()

                  switch (radioGroup_play_controls.active) {
                    case play_controls.step:
                      // if stepping, then goto pause which will trigger enabling the DateRangeSlider
                      radioGroup_play_controls = play_controls.pause;
                      break;
                  }
                }, spinner_minStepTime.value*1000 - dt);
              }
            }, 10000)
          }
          break;
      }
      break;
}


// ----------------------------------------
// Support Functions:
// ----------------------------------------


// Find nearest value and index
function find_in_sorted_array(x, sorted_array) {
  var i = 0;
  while (x > sorted_array[i] & i < sorted_array.length - 1) {
    i += 1
  }
  return {
    'value1e6': sorted_array[i]*1e6,
    'value': sorted_array[i],
    'index': i
  }
}

// Replace nan with nan_code in a dictionary of arrays
function rep_nan_code(dic, nan_code) {
  var inds
  for (var key in dic) {
    if (Array.isArray(dic[key])) {
      dic[key] = array_element_replace(dic[key], nan_code, NaN)
    }
  }
  return dic;
}

// Replace old_value with new_value in an array
function array_element_replace(arr, old_value, new_value) {
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      if (arr[i].length > 1) {
        arr[i] = array_element_replace(arr[i], old_value, new_value)
      } else {
        if (arr[i] === old_value) {
          arr[i] = new_value;
        }
      }
    } else {
      if (arr[i] === old_value) {
        arr[i] = new_value;
      }
    }
  }
  return arr;
}

function correct_date_format(dic, key = 'date') {
  const mul = 1e-6
  dic[key] = dic[key].map(function(a) {
    return a * mul;
  })
  return dic
}

// Reading gzip json data
function readJSONgz_fun(file, fun_onload, timeout = 2000) {
  // Based on https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
  var data;
  var request = new XMLHttpRequest();
  request.responseType = 'arraybuffer';
  request.ontimeout = function() {
    console.error("The request for " + file + " timed out.");
  };
  request.timeout = timeout;
  request.onload = fun_onload;
  request.open('GET', file);
  request.send();


  return request;
}
