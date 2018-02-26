using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using BadgeDataServiceDemo.Resources;
using System.Threading.Tasks;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using Windows.Networking.Proximity;
using Windows.Storage.Streams;
using ITNCommon;

namespace BadgeDataServiceDemo {
    public partial class MainPage : PhoneApplicationPage {

        private ProximityDevice proxDevice;
        private long subscriptionID; 

        // Constructor
        public MainPage() {
            InitializeComponent();

            //initialize the NFC Reader of the winphone device
            //WMAppManifest.xml must have the proximity capability (ID_CAP_PROXIMITY) checked off.
            proxDevice = ProximityDevice.GetDefault();

            if(proxDevice != null) { //device initialized successfully
                //add the handlers
                proxDevice.DeviceArrived += proxDevice_DeviceArrived;
                proxDevice.DeviceDeparted += proxDevice_DeviceDeparted;
            }
        }

        void proxDevice_DeviceArrived(ProximityDevice sender) {
            Dispatcher.BeginInvoke(() => {
                Status.Text = "status: reading...";
            });
        }

        void proxDevice_DeviceDeparted(ProximityDevice sender) {
            Dispatcher.BeginInvoke(() => {
                Status.Text = "status: ready to read badge";
            });
        }

        protected override void OnNavigatedTo(NavigationEventArgs e) {
            base.OnNavigatedTo(e);

            if(proxDevice == null) {
                Status.Text = "status: nfc unavailable";
                return;
            }
            else {
                Status.Text = "status: ready to read badge";
            }
            subscriptionID = proxDevice.SubscribeForMessage("NDEF:ext.bcard.net:bcard", MessageReceived); //execute message received handler ONLY if a BCARD has been presented
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e) {
            base.OnNavigatedFrom(e);
            proxDevice.StopSubscribingForMessage(subscriptionID);
        }

        private void MessageReceived(ProximityDevice sender, ProximityMessage message) {
            Dispatcher.BeginInvoke(() => {
                var buf = DataReader.FromBuffer(message.Data);
                List<NdefRecord> recordList = new List<NdefRecord>();
                NdefRecordUtility.ReadNdefRecord(buf, recordList);
                NdefRecord firstRecord = recordList[0];
                byte[] payload = firstRecord.Payload;
                GetBadgeData(payload);
            });
        }

        private async void GetBadgeData(byte[] ndefPayload) {
            Status.Text = "status: executing web request...";
            SystemTray.ProgressIndicator = new ProgressIndicator();
            SystemTray.ProgressIndicator.Text = "Busy";
            SystemTray.ProgressIndicator.IsIndeterminate = true;
            SystemTray.ProgressIndicator.IsVisible = true;

            string base64EncodedNdefPayload = Convert.ToBase64String(ndefPayload);
            string webServiceEndpoint = "https://mobile.bcard.net/Services/BadgeDataService/BadgeDataService.svc/GetBadgeData";

            BadgeDataService.BadgeRequest badgeRequest = new BadgeDataService.BadgeRequest();
            badgeRequest.ActivationCode = ""; // unique to an event, contact ITN to request an activation code for an event.
            badgeRequest.AuthKey = ""; // unique to a service user. To become authorized to use this service contact ITN.
            badgeRequest.DeviceIdentifier = "TestDevice"; // a value to identify which name you'd like to give to the records collected by a particular device.
            badgeRequest.NdefRecord = base64EncodedNdefPayload; // ITN (BCARD badges) contain an NDEF record with the payload type "bcard.net:bcard" 
                                                                // Send in the byte array of the payload of this record only, not the entire NDEF record, base64 encoded, in this field.
            badgeRequest.QrCode = ""; //not yet implemented

            string json = JsonConvert.SerializeObject(badgeRequest); //serialize object to JSON
            HttpWebRequest request = WebRequest.CreateHttp(webServiceEndpoint);

            string response = await httpStreamJsonRequest(request, json, "POST");
            BadgeDataService.BadgeReply badgeReply = JsonConvert.DeserializeObject<BadgeDataService.BadgeReply>(response); //deserialze JSON to object

            if(badgeReply.Success) {
                Status.Text = "status: badge returned successfully";
                AccountID.Text = badgeReply.BadgeData.AccountID;
                Address1.Text = badgeReply.BadgeData.Address1;
                Address2.Text = badgeReply.BadgeData.Address2;
                Address3.Text = badgeReply.BadgeData.Address3;
                City.Text = badgeReply.BadgeData.City;
                Company.Text = badgeReply.BadgeData.Company;
                Country.Text = badgeReply.BadgeData.Country;
                Division.Text = badgeReply.BadgeData.Division;
                Email.Text = badgeReply.BadgeData.Email;
                EventID.Text = badgeReply.BadgeData.EventID;
                Fax.Text = badgeReply.BadgeData.Fax;
                FirstName.Text = badgeReply.BadgeData.Firstname;
                LastName.Text = badgeReply.BadgeData.Lastname;
                MiddleName.Text = badgeReply.BadgeData.Middlename;
                Phone.Text = badgeReply.BadgeData.Phone1;
                Mobile.Text = badgeReply.BadgeData.Phone2;
                Salutation.Text = badgeReply.BadgeData.Salutation;
                State.Text = badgeReply.BadgeData.State;
                Suffix.Text = badgeReply.BadgeData.Suffix;
                TelCode.Text = badgeReply.BadgeData.TelCountryCode;
                JobTitle.Text = badgeReply.BadgeData.Title;
                URL.Text = badgeReply.BadgeData.URL;
                ZipPostal.Text = badgeReply.BadgeData.Zip;
                StoredUID.Text = badgeReply.BadgeData.StoredUID;
            }
            else {
                Status.Text = "status: " + badgeReply.ErrorMessage;
                ClearFields();
            }

            SystemTray.ProgressIndicator.IsVisible = false;
        }

        private async Task<string> httpStreamJsonRequest(HttpWebRequest request, string jsonToSend, string method) {
            string received = "";
            if(request.Headers == null) {
                request.Headers = new WebHeaderCollection();
            }
            request.Headers[HttpRequestHeader.IfModifiedSince] = DateTime.UtcNow.ToString("r"); //to avoid caching
            try {
                request.Method = method;
                request.ContentType = "application/json";
                using(Stream requestStream = await Task.Factory.FromAsync<Stream>(request.BeginGetRequestStream, request.EndGetRequestStream, null)) {
                    byte[] content = Encoding.UTF8.GetBytes(jsonToSend);
                    requestStream.Write(content, 0, content.Length);
                }

                using(var response = (HttpWebResponse)(await Task<WebResponse>.Factory.FromAsync(request.BeginGetResponse, request.EndGetResponse, null))) {
                    using(var responseStream = response.GetResponseStream()) {
                        using(var sr = new StreamReader(responseStream)) {
                            received = await sr.ReadToEndAsync();
                        }
                    }
                }
            }
            catch(Exception ex) {
                Console.WriteLine(ex.Message);
            }
            return received;
        }

        private void ClearFields() {
            AccountID.Text = "";
            Address1.Text = "";
            Address2.Text = "";
            Address3.Text = "";
            City.Text = "";
            Company.Text = "";
            Country.Text = "";
            Division.Text = "";
            Email.Text = "";
            EventID.Text = "";
            Fax.Text = "";
            FirstName.Text = "";
            LastName.Text = "";
            MiddleName.Text = "";
            Phone.Text = "";
            Mobile.Text = "";
            Salutation.Text = "";
            State.Text = "";
            Suffix.Text = "";
            TelCode.Text = "";
            JobTitle.Text = "";
            URL.Text = "";
            ZipPostal.Text = "";
            StoredUID.Text = "";
        }
    }
}