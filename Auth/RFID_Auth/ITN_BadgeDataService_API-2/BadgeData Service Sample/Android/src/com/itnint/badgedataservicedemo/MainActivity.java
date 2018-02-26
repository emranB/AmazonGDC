package com.itnint.badgedataservicedemo;

import com.itnint.badgedataservicedemo.BadgeServiceTask.AsyncResponse;

import android.support.v7.app.ActionBarActivity;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.nfc.NdefMessage;
import android.nfc.NfcAdapter;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.Parcelable;
import android.util.Base64;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends Activity implements AsyncResponse {

	EditText accountID;
	EditText eventID;
	EditText storedUID;
	EditText salutation;
	EditText firstName;
	EditText middleName;
	EditText lastName;
	EditText suffix;
	EditText jobTitle;
	EditText company;
	EditText division;
	EditText email;
	EditText url;
	EditText address1;
	EditText address2;
	EditText address3;
	EditText city;
	EditText state;
	EditText postalCode;
	EditText country;
	EditText telCode;
	EditText phone;
	EditText mobile;
	EditText fax;
	TextView feedback;
	NfcAdapter nfcAdapter;
	PendingIntent pendingIntent;
	Handler screenResetHandler;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		wireUpUI();
		
		nfcAdapter = NfcAdapter.getDefaultAdapter(this);
		pendingIntent = PendingIntent.getActivity(this, 0, new Intent(this, getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);
		
		feedback.setText(R.string.touch_bcard);
		
		screenResetHandler = new Handler();
	}
	
	@Override
	public void onResume() {
		super.onResume();
		//attach the nfc adapter to this app if it's in the foreground
		nfcAdapter.enableForegroundDispatch(this, pendingIntent, null, null);
	}
	
	@Override
	public void onPause() {
		super.onPause();
		//release the nfc adapter if this app is not active
		nfcAdapter.disableForegroundDispatch(this);
	}
	
	@Override
	public void onNewIntent(Intent intent) {
		feedback.setText("Reading...");
		try {
			Parcelable[] rawMsgs = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
			NdefMessage msg = (NdefMessage)rawMsgs[0];
			String recordType = new String(msg.getRecords()[0].getType(), "UTF-8");
			if(recordType.equals("bcard.net:bcard")) { //this is a bcard
				byte[] bcardEncryptedData = msg.getRecords()[0].getPayload();
			
				//send to badge service
				feedback.setText(R.string.sending_to_service);
				BadgeRequest badgeRequest = new BadgeRequest();
				
				badgeRequest.ActivationCode = ""; // unique to an event, contact ITN to request an activation code for an event.
		        badgeRequest.AuthKey = ""; // unique to a service user. To become authorized to use this service contact ITN.
		        badgeRequest.DeviceIdentifier = "TestDevice"; // a value to identify which name you'd like to give to the records collected by a particular device.
		        badgeRequest.NdefPayload = Base64.encodeToString(bcardEncryptedData, Base64.NO_WRAP); // ITN (BCARD badges) contain an NDEF record with the payload type "bcard.net:bcard" 
	                                                                // Send in the byte array of the payload of this record only, not the entire NDEF record, base64 encoded, in this field.
	            badgeRequest.QrCode = ""; //not yet implemented

				AsyncTask<BadgeRequest, Void, BadgeReply> badgeServiceTask = new BadgeServiceTask(this); //<- pass 'this' to the constructor to be able to get the result
				badgeServiceTask.execute(badgeRequest);
			}
			else {
				feedback.setText(R.string.error_not_bcard);
				screenResetHandler.postDelayed(screenReset, 2500);
			}
		}
		catch(Exception eIgnore) {
			feedback.setText(R.string.error_reading_badge);
			screenResetHandler.postDelayed(screenReset, 2500);
			eIgnore.printStackTrace();
		}
	}

	@Override
	public void serviceComplete(BadgeReply output) {
		boolean success = output.Success;
					
		if(success) {
			//do all the work to save and/or display the contents here
			feedback.setText("Result: Badge returned successfully.");
			populateUI(output.BadgeData);
		//	screenResetHandler.postDelayed(screenReset, 2500);
		}
		else {
			feedback.setText("Result: " + output.ErrorMessage);
		//	screenResetHandler.postDelayed(screenReset, 2500);
		}
	}
	
	Runnable screenReset = new Runnable() {
		@Override
		public void run() {
			feedback.setText(R.string.touch_bcard);
		}
	};
	
	private void populateUI(BCARDData data) {
		accountID.setText(data.AccountID);
		eventID.setText(data.EventID);
		storedUID.setText(data.StoredUID);
		salutation.setText(data.Salutation);
		firstName.setText(data.Firstname);
		middleName.setText(data.Middlename);
		lastName.setText(data.Lastname);
		suffix.setText(data.Suffix);
		jobTitle.setText(data.Title);
		company.setText(data.Company);
		division.setText(data.Division);
		email.setText(data.Email);
		url.setText(data.URL);
		address1.setText(data.Address1);
		address2.setText(data.Address2);
		address3.setText(data.Address3);
		city.setText(data.City);
		state.setText(data.State);
		postalCode.setText(data.Zip);
		country.setText(data.Country);
		telCode.setText(data.TelCountryCode);
		phone.setText(data.Phone1);
		mobile.setText(data.Phone2);
		fax.setText(data.Fax);
	}
	
	private void wireUpUI() {
		feedback = (TextView)findViewById(R.id.feedbackTextView);
		accountID = (EditText)findViewById(R.id.accountIDText);
		eventID = (EditText)findViewById(R.id.eventIDText);
		storedUID = (EditText)findViewById(R.id.storedUIDText);
		salutation = (EditText)findViewById(R.id.salutationText);
		firstName = (EditText)findViewById(R.id.firstNameText);
		middleName = (EditText)findViewById(R.id.middleNameText);
		lastName = (EditText)findViewById(R.id.lastNameText);
		suffix = (EditText)findViewById(R.id.suffixText);
		jobTitle = (EditText)findViewById(R.id.jobTitleText);
		company = (EditText)findViewById(R.id.companyText);
		division = (EditText)findViewById(R.id.divisionText);
		email = (EditText)findViewById(R.id.emailText);
		url = (EditText)findViewById(R.id.urlText);
		address1 = (EditText)findViewById(R.id.address1Text);
		address2 = (EditText)findViewById(R.id.address2Text);
		address3 = (EditText)findViewById(R.id.address3Text);
		city = (EditText)findViewById(R.id.cityText);
		state = (EditText)findViewById(R.id.stateText);
		postalCode = (EditText)findViewById(R.id.postalCodeText);
		country = (EditText)findViewById(R.id.countryText);
		telCode = (EditText)findViewById(R.id.telCodeText);
		phone = (EditText)findViewById(R.id.phoneText);
		mobile = (EditText)findViewById(R.id.mobileText);
		fax = (EditText)findViewById(R.id.faxText);
	}

	
//	@Override
//	public boolean onCreateOptionsMenu(Menu menu) {
//		// Inflate the menu; this adds items to the action bar if it is present.
//		getMenuInflater().inflate(R.menu.main, menu);
//		return true;
//	}
//
//	@Override
//	public boolean onOptionsItemSelected(MenuItem item) {
//		// Handle action bar item clicks here. The action bar will
//		// automatically handle clicks on the Home/Up button, so long
//		// as you specify a parent activity in AndroidManifest.xml.
//		int id = item.getItemId();
//		if (id == R.id.action_settings) {
//			return true;
//		}
//		return super.onOptionsItemSelected(item);
//	}
}
