package com.itnint.badgedataservicedemo;

import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONObject;
import org.json.JSONStringer;

import android.os.AsyncTask;
import android.util.Log;
import android.os.AsyncTask;

public class BadgeServiceTask extends AsyncTask<BadgeRequest, Void, BadgeReply>{
	// define an interface and delegate here to send data back to the caller
	public interface AsyncResponse{
		void serviceComplete(BadgeReply output);
	}
	private AsyncResponse listener; // delegate
	private final static String ServiceURI = "https://mobile.bcard.net/Services/BadgeDataService/BadgeDataService.svc/GetBadgeData";
	public BadgeServiceTask(AsyncResponse listener) {
		this.listener = listener;
	}
	
	@Override
	protected BadgeReply doInBackground(BadgeRequest... data) {
		BadgeReply badgeReply = new BadgeReply();
		badgeReply.BadgeData = new BCARDData();
		
		try {
			HttpPost request = new HttpPost(ServiceURI);
			request.setHeader("Accept", "application/json");
			request.setHeader("Content-Type", "application/json");

			JSONStringer badgeRequest = new JSONStringer()
				.object()
						.key("ActivationCode").value(data[0].ActivationCode)
						.key("AuthKey").value(data[0].AuthKey)
						.key("DeviceIdentifier").value(data[0].DeviceIdentifier)
						.key("NdefRecord").value(data[0].NdefPayload)
						.key("QrCode").value(data[0].QrCode)
				.endObject();
			
			StringEntity entity = new StringEntity(badgeRequest.toString());
			entity.setContentType("application/json");
			request.setEntity(entity);
			
			DefaultHttpClient httpClient = new DefaultHttpClient();
			HttpResponse httpResponse = httpClient.execute(request); // sends the json entity to the service

			Log.d("BadgeService", "Status Code: " + httpResponse.getStatusLine().getStatusCode());
			
			if (httpResponse.getStatusLine().getStatusCode() == 200) {
				HttpEntity responseEntity = httpResponse.getEntity();
				
				// read response data into buffer
				char[] buffer = new char[(int)responseEntity.getContentLength()];
				InputStream stream = responseEntity.getContent();
				InputStreamReader reader = new InputStreamReader(stream);
				reader.read(buffer);
				stream.close();
				
				JSONObject reply = new JSONObject(new String(buffer));
				badgeReply.Success = reply.getBoolean("Success");
				badgeReply.ErrorMessage = reply.getString("ErrorMessage");
				JSONObject badgeData = reply.getJSONObject("BadgeData");
				badgeReply.BadgeData.AccountID = badgeData.getString("AccountID");
				badgeReply.BadgeData.EventID = badgeData.getString("EventID");
				badgeReply.BadgeData.StoredUID = badgeData.getString("StoredUID");
				badgeReply.BadgeData.Firstname = badgeData.getString("Firstname");
				badgeReply.BadgeData.Middlename = badgeData.getString("Middlename");
				badgeReply.BadgeData.Lastname = badgeData.getString("Lastname");
				badgeReply.BadgeData.Salutation = badgeData.getString("Salutation");
				badgeReply.BadgeData.Suffix = badgeData.getString("Suffix");
				badgeReply.BadgeData.Title = badgeData.getString("Title");
				badgeReply.BadgeData.Company = badgeData.getString("Company");
				badgeReply.BadgeData.Division = badgeData.getString("Division");
				badgeReply.BadgeData.Email = badgeData.getString("Email");
				badgeReply.BadgeData.URL = badgeData.getString("URL");
				badgeReply.BadgeData.Address1 = badgeData.getString("Address1");
				badgeReply.BadgeData.Address2 = badgeData.getString("Address2");
				badgeReply.BadgeData.Address3 = badgeData.getString("Address3");
				badgeReply.BadgeData.City = badgeData.getString("City");
				badgeReply.BadgeData.State = badgeData.getString("State");
				badgeReply.BadgeData.Country = badgeData.getString("Country");
				badgeReply.BadgeData.Zip = badgeData.getString("Zip");
				badgeReply.BadgeData.TelCountryCode = badgeData.getString("TelCountryCode");
				badgeReply.BadgeData.Phone1 = badgeData.getString("Phone1");
				badgeReply.BadgeData.Phone2 = badgeData.getString("Phone2");
				badgeReply.BadgeData.Fax = badgeData.getString("Fax");
			}
			
		}
		catch(Exception eIgnore) {

			Log.d("BadgeService", "BadgeData parsing: " + eIgnore.getMessage());
			eIgnore.printStackTrace();
		}
		
		return badgeReply;
	}
	
	@Override
	protected void onPostExecute(BadgeReply result) {
		//send the results back to the caller
		listener.serviceComplete(result);
	}

}
