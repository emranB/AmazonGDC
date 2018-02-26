using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BadgeDataServiceDemo {
    public partial class FormMain : Form {

        BcardNdefScm.Reader scmReader;

        public FormMain() {
            InitializeComponent();
        }

        private void FormMain_Load(object sender, EventArgs e) {
            scmReader = new BcardNdefScm.Reader();
            if(scmReader.SCMConnect()) {
                lblReaderStatus.Text = "Reader Status: SCM reader found";
                lblTagStatus.Text = "Tag Status: Waiting for tag";
                scmReader.TagArrived += scmNdef_TagArrived;
                scmReader.TagDeparted += scmNdef_TagDeparted;
            }
            else {
                lblReaderStatus.Text = "Reader Status: No reader found";
                lblTagStatus.Text = "Tag Status: Not Available";
            }
        }

        private void FormMain_FormClosed(object sender, FormClosedEventArgs e) {
            scmReader.SCMDisconnect();
        }

        void scmNdef_TagArrived(object sender, BcardNdefScm.TagArrivedEventArgs e) {
            lblTagStatus.Text = "Tag Status: Tag arrived";
            if(e.NdefPayloadType == "bcard.net:bcard") {
                GetBadgeData(e.NdefPayload);
            }
        }

        void scmNdef_TagDeparted(object sender, EventArgs e) {
            lblTagStatus.Text = "Tag Status: Waiting for tag.";
        }

        private void GetBadgeData(byte[] ndefPayload) {
            lblResult.Text = "Service Status: Sending Read...";
            //example only
            //byte[] mockNdefPayload = new byte[] { 0x32, 0x30, 0x39, 0x35, 0x30, 0x37, 0x1e, 0x31, 0x35, 0x39, 0x37, 0x1f, 0x1f, 0x47, 0x75, 0x69, 0x64, 0x6f, 0x1f, 0x47, 0x72, 0x69, 0x65, 0x73, 0x65, 0x1f, 0x1f, 0x1f, 0xc6, 0x1a, 0x69, 0xb7, 0x86, 0x30, 0x1f, 0x9e, 0xdc, 0x84, 0x69, 0x1a, 0xff, 0x91, 0xcd, 0xb5, 0xda, 0xb7, 0x5e, 0x09, 0xbe, 0x1b, 0x7f, 0xeb, 0xa9, 0x9d, 0x48, 0x5b, 0x76, 0xc4, 0xe9, 0x1c, 0x05, 0x03, 0xa2, 0x27, 0xd8, 0xd3, 0xb5, 0xa1, 0xb0, 0xfa, 0x6c, 0x5c, 0x89, 0xc0, 0xd6, 0x35, 0xdb, 0x48, 0x03, 0x08, 0x17, 0x06, 0xaf, 0xd6, 0xf7, 0xfa, 0xce, 0x38, 0x52, 0x10, 0x37, 0x3d, 0x92, 0x8c, 0x7c, 0x62, 0xa1, 0x48, 0x63, 0xc8, 0xd1, 0x6f, 0xae, 0x06, 0xfd, 0x96, 0xcb, 0x5f, 0xe0, 0x38, 0x53, 0xc5, 0xc3, 0x70, 0xf0, 0x4f, 0x02, 0xbf, 0x60, 0xf6, 0x14, 0xf4, 0x0c, 0x22, 0xfc, 0x71, 0x38, 0x6b, 0xff, 0xb4, 0x46, 0x0d, 0xe5, 0x45, 0x22, 0x20, 0xf9, 0x96, 0xb4, 0x31, 0xc5, 0x0a, 0x2f, 0x8f, 0xc5, 0x37, 0x2b, 0xa9, 0x4a, 0xbd, 0x85, 0x3c, 0xb1, 0x93, 0x3c, 0x88, 0xd3, 0xb1, 0x4f, 0x13, 0x2f, 0x0a, 0x88, 0xce, 0x73, 0xd8, 0x74, 0x1d, 0xba, 0x7f, 0x8c, 0x4d, 0x6f, 0xbb, 0x32, 0x93, 0x4f, 0xbd, 0xe1, 0xe5, 0xeb, 0xa1, 0xc0, 0x96, 0xdd, 0x50, 0x27, 0x05, 0xcc, 0xdc, 0x4b, 0x85, 0xe2, 0xa0, 0x3e, 0x4e, 0xde, 0xf3, 0xd4, 0x99, 0xa6, 0xea, 0x4e, 0xe7 };
            string base64EncodedNdefPayload = Convert.ToBase64String(ndefPayload);
            string webServiceEndpoint = "https://mobile.bcard.net/Services/BadgeDataService/BadgeDataService.svc/GetBadgeData";

            BadgeDataService.BadgeRequest badgeRequest = new BadgeDataService.BadgeRequest();
            badgeRequest.ActivationCode = "156D3AE"; // unique to an event, contact ITN to request an activation code for an event.
            badgeRequest.AuthKey = "ITNTest"; // unique to a service user. To become authorized to use this service contact ITN.
            badgeRequest.DeviceIdentifier = "TestDevice"; // a value to identify which name you'd like to give to the records collected by a particular device.
            badgeRequest.NdefRecord = base64EncodedNdefPayload; // ITN (BCARD badges) contain an NDEF record with the payload type "bcard.net:bcard" 
                                                                // Send in the byte array of the payload of this record only, not the entire NDEF record, base64 encoded, in this field.
            badgeRequest.QrCode = ""; //not yet implemented

            BadgeDataService.BadgeReply badgeReply;

            using(WebClient webClient = new WebClient()) {
                webClient.Headers[HttpRequestHeader.Accept] = "application/json";
                webClient.Headers[HttpRequestHeader.ContentType] = "application/json";

                using(var memStream = new MemoryStream()) {
                    DataContractJsonSerializer jsonSerializer = new DataContractJsonSerializer(typeof(BadgeDataService.BadgeRequest));
                    
                    jsonSerializer.WriteObject(memStream, badgeRequest);
                    string stringRep = Encoding.UTF8.GetString(memStream.ToArray());
                    var response = webClient.UploadData(webServiceEndpoint, "POST", memStream.ToArray());

                    DataContractJsonSerializer jsonDeserializer = new DataContractJsonSerializer(typeof(BadgeDataService.BadgeReply));
                    using(var inStream = new MemoryStream(response)) {
                        badgeReply = jsonDeserializer.ReadObject(inStream) as BadgeDataService.BadgeReply;
                    }
                }
            }

            if(badgeReply.Success) {
                lblResult.Text = "Service Status: Badge returned successfully";
                txtAccountID.Text = badgeReply.BadgeData.AccountID;
                txtAddress1.Text = badgeReply.BadgeData.Address1;
                txtAddress2.Text = badgeReply.BadgeData.Address2;
                txtAddress3.Text = badgeReply.BadgeData.Address3;
                txtCity.Text = badgeReply.BadgeData.City;
                txtCompany.Text = badgeReply.BadgeData.Company;
                txtCountry.Text = badgeReply.BadgeData.Country;
                txtDivision.Text = badgeReply.BadgeData.Division;
                txtEmail.Text = badgeReply.BadgeData.Email;
                txtEventID.Text = badgeReply.BadgeData.EventID;
                txtFax.Text = badgeReply.BadgeData.Fax;
                txtFirstname.Text = badgeReply.BadgeData.Firstname;
                txtLastname.Text = badgeReply.BadgeData.Lastname;
                txtMiddlename.Text = badgeReply.BadgeData.Middlename;
                txtPhone1.Text = badgeReply.BadgeData.Phone1;
                txtPhone2.Text = badgeReply.BadgeData.Phone2;
                txtPrefix.Text = badgeReply.BadgeData.Salutation;
                txtState.Text = badgeReply.BadgeData.State;
                txtSuffix.Text = badgeReply.BadgeData.Suffix;
                txtTelCode.Text = badgeReply.BadgeData.TelCountryCode;
                txtTitle.Text = badgeReply.BadgeData.Title;
                txtURL.Text = badgeReply.BadgeData.URL;
                txtZip.Text = badgeReply.BadgeData.Zip;
                txtStoredUID.Text = badgeReply.BadgeData.StoredUID;
            }
            else {
                lblResult.Text = "Service Status: " + badgeReply.ErrorMessage;
                ClearCardData();
            }
        }

        private void ClearCardData() {
            txtAccountID.Text = "";
            txtAddress1.Text = "";
            txtAddress2.Text = "";
            txtAddress3.Text = "";
            txtCity.Text = "";
            txtCompany.Text = "";
            txtCountry.Text = "";
            txtDivision.Text = "";
            txtEmail.Text = "";
            txtEventID.Text = "";
            txtFax.Text = "";
            txtFirstname.Text = "";
            txtLastname.Text = "";
            txtMiddlename.Text = "";
            txtPhone1.Text = "";
            txtPhone2.Text = "";
            txtPrefix.Text = "";
            txtState.Text = "";
            txtSuffix.Text = "";
            txtTelCode.Text = "";
            txtTitle.Text = "";
            txtURL.Text = "";
            txtZip.Text = "";
            txtStoredUID.Text = "";
        }
    }
}
