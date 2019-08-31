/* Update displayed data on mobile device*/

console.log('Hi robert')
console.log(document.getElementById('grip-slider'));
var slider = document.getElementById('grip-slider');
var grip_data_output = document.getElementById('grip-data');

//initialize grip data output
console.log('slider.value: ' + slider.value);
grip_data_output.innerHTML = slider.value;



slider.oninput = function() {
    console.log('this.value: ' + this.value)
    grip_data_output.innerHTML = this.value;
}




