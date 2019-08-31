/* Update displayed data on mobile device*/

/*console.log('Hi robert')
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
*/

//GIVEN
if (window.hyper && window.hyper.log) { console.log = hyper.log }

//initialize the app 
document.addEventListener(
    'deviceready',
    function() { evothings.scriptsLoaded(app.initialize) },
    false);
//DONE

//TODO: instantiate an app object
var app = {}

app.SERVICE_UUID='0000ffe0-0000-1000-8000-00805f9b34fb';
app.CHARACTERISTIC_UUID='0000ffe1-0000-1000-8000-00805f9b34fb';

//TODO: write an initialization method for the app object
//that adds a "connected" property to app, set its value to false
app.initialize = function()
{
    app.connected = false;
};

//TODO: fill in code for startScan method
app.startScan = function()
{
    //TODO: disconnect the app to "clean up"
    app.disconnect();

    console.log('Scanning started...');

    //TODO: instantiate a new devices property for the app object
    //NOTE: the devices property is an array that will hold all the devices detected through the scan
    app.devices = {};

    //GIVEN
    var htmlString = 
        '<img src="ui/images/loader.gif" style="width:10%"' +
            'style="display:inline; vertical-align:middle">' +    
        '<p style="display:inline"> Scanning...</p>';
    //DONE
        
    //TODO: append the html string between scanResultView's tags
    //Reference: <div id="scanResultView" style="display:none"> HTML string will go here </div>
    $('#scanResultView').append($(htmlString));

    //TODO: display scanResultView
    $('#scanResultView').show();

    //TODO: fill in code for deviceFound(device) callback
    function onScanSuccess(device) //device is object of evothings.easyble.EasyBLEDevice namespace
    {
        if(device.name !=null)
        {
            //TODO: add the device found to the devices array, indexed by the device's address
            app.devices[device.address] = device;

            console.log(
                'Found: ' + device.name + ', ' + 
                device.address + ', ' + device.rssi);

            //HTML styling for how the device information will be displayed during the scanning
            var htmlString = 
                '<div class="deviceContainer" onclick="app.connectTo(\'' +
                    device.address + '\')">' + 
                '<p class="deviceName">' + device.name + '</p>' + 
                '<p class="deviceAddress">' + device.address + '</p>' + 
                '</div>';

            //TODO: append the device information to be displayed scanResultView
        //NOTE: each time a device is found, its information will be appended
            $('#scanResultView').append($(htmlString));
        }

        
        
    }

    //TODO: fill in code for scanError(errorCode) callback
    function onScanFailure(errorCode)
    {
        //TODO: disconnect the app with appropriate error message
        app.disconnect('Failed to scan for devices.');

        //TODO: Write debug information to console using the errorCode.
        console.log('Error ' + errorCode);
    }

    //TODO: call on Evothings to start the scan
    evothings.easyble.startScan(onScanSuccess,onScanFailure, {allowDuplicates: false});

    //TODO: hide the startView
    $('#startView').hide();

};

//TODO: fill in code to disconnect app
app.disconnect = function(errorMessage)
{
    //GIVEN: error alert on phone
    if (errorMessage)
    {
        navigator.notification.alert(errorMessage, function () {});
    }
    //DONE

    //TODO: set app's connected property to false
    //set app's device to null
    app.connected = false;
    app.device = null;

    //TODO: stop any outgoing scans
    evothings.easyble.stopScan();

    //TODO: close devices
    evothings.easyble.closeConnectedDevices();

    console.log('Disconnected');
    //TODO: reset view to front page
	$('#scanResultView').hide();
	$('#scanResultView').empty();
	$('#controlsView').hide();
	$('#startView').show();

}

app.test = function()
{
    $('#startView').hide();
    $('#controlsView').show();
}

//GIVEN
app.setLoadingLabel = function(message)
{
    console.log(message);
    $('#loadingStatus').text(message)
}

//NOTE: how to restructure this better? 
app.connectTo = function(address)
{

    //access the device from the devices array with the address of the parameter 
	device = app.devices[address];

    //display detected bluetooth modules in table format
	$('#loadingView').css('display', 'table');

    app.setLoadingLabel('Trying to connect to ' + device.name);
    
	function onConnectSuccess(device)
	{
		function onServiceSuccess(device)
		{
			// Application is now connected
			app.connected = true;
			app.device = device;

			console.log('Connected to ' + device.name);

			$('#loadingView').hide();
			$('#scanResultView').hide();
			$('#controlsView').show();

			device.enableNotification(
			  app.SERVICE_UUID,
				app.CHARACTERISTIC_UUID,
				app.receivedData,
				function(errorCode) {
					console.log('BLE enableNotification error: ' + errorCode);
				},
				{ writeConfigDescriptor: false });
		}

		function onServiceFailure(errorCode)
		{
			// Disconnect and show an error message to the user.
			app.disconnect('Device is not from DFRobot');

			// Write debug information to console.
			console.log('Error reading services: ' + errorCode);
		}

		app.setLoadingLabel('Identifying services...');

		// Read values from the service_UUID
		device.readServices(onServiceSuccess, onServiceFailure, [app.SERVICE_UUID]);
	}

	function onConnectFailure(errorCode)
	{
		// Disconnect and show an error message to the user.
		app.disconnect('Failed to connect to device');

		// Write debug information to console
		console.log('Error ' + errorCode);
	}

	// Stop scanning
	evothings.easyble.stopScan();

	// Connect to our device
	console.log('Identifying service for communication');
	device.connect(onConnectSuccess, onConnectFailure);
};
//DONE

//TODO: fill in code for sendData method
//data parameter represents the data the user wants to send to the Arduino
app.sendData = function(data)
{
    //TODO: if app is connected
    if(app.connected)
    {
        //TODO: write message success callback
        //console log appropriate message
        function onMessageSendSuccess()
        {
            console.log('Succeeded to send message.');
        }

        //TODO: write message failure callback
        //console log appropriate message, with errorCode
        //disconnect app with error message 
        function onMessageSendFailure(errorCode)
        {
            console.log('Failed to send data with error: ' + errorCode);
            app.disconnect('Failed to send data');
        }

        //convert data fron ArrayBuffer into Uint8Array
        data = new Uint8Array(data);

        //TODO: write value of app's device property's data to Arduino
        app.device.writeCharacteristic(
            app.CHARACTERISTIC_UUID,
            data,
            onMessageSendSuccess,
            onMessageSendFailure);
    }
    //TODO: if app is not connected
    else
    {
        //TODO: disconnect and show an error message to the user
        app.disconnect('Disconnected');

        //TODO: write debug information to console
        console.log('Error- No device connected');
    }
}

//TODO: fill in code for receivedData method
//data parameter represents the data sent from the Arduino by the HM-10
app.receivedData = function(data)
{
    //TODO: if the app is connected
    if (app.connected)
    {
        //create Uint8Array data from ArrayBuffer
        var data = new Uint8Array(data);

         //TODO: if (data[0] identifier for G, W, E, B)
        // read and update values of data[1] for G, W, E, B

        if (data[0] == 0x00)
        {
            console.log('Data received for G');
            $('#grip_reading').text(data[1]);
        }

        if (data[0] == 0x01)
        {
            console.log('Data received for E');
            $('#elbow_reading').text(data[1]);
        }

        if (data[0] == 0x02)
        {
            console.log('Data received for S');
            $('#shoulder_reading').text(data[1]);
        }

        if (data[0] == 0x03)
        {
            console.log('Data received for B');
            $('#base_reading').text(data[1]);
        }
    }

    //TODO: if the app is not connected
    else
    {
        //TODO: disconnect and show an error message to the user
        app.disconnect('Disconnected');

        //TODO: Write debug information to console
        console.log('Error - No device connected');
    }
}





