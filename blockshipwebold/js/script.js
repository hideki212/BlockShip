function submitBill() {
  // avoid to execute the actual submit of the form.
  var form = $("#billoflading");
  var info = {
    info: {
      billoflading: {
        BolNumber: form[0][0].value,
        CarrierName: form[0][1].value,
        SPAC: form[0][2].value,
        TrailerNumber: form[0][3].value,
        SerialNumber: form[0][4].value,
        Shipfromname: form[0][5].value,
        SIDNo: form[0][6].value,
        FromAddressLine1: form[0][7].value,
        FromAddressLine2: form[0][8].value,
        FromCity: form[0][9].value,
        FromState: form[0][10].value,
        FromZipCode: form[0][11].value,
        Shiptoname: form[0][12].value,
        CIDNo: form[0][13].value,
        ToAddressLine1: form[0][14].value,
        ToAddressLine2: form[0][15].value,
        ToCity: form[0][16].value,
        ToState: form[0][17].value,
        ToZipCode: form[0][18].value,
        Thirdpartyname: form[0][19].value,
        TPAddressLine1: form[0][20].value,
        TPAddressLine2: form[0][21].value,
        TPCity: form[0][22].value,
        TPState: form[0][23].value,
        TPZipCode: form[0][24].value,
        prepaid: form[0][25].value,
        FCT: form[0][26].value,
        Masterbill: form[0][27].value
      }
    }
  };
  info = JSON.stringify(info);
  var url = form.attr("action");
  $.ajax({
    type: "POST",
    url: url,
    crossDomain: true,
    contentType: "application/json; charset=utf-8",
    data: info, // serializes the form's elements.
    dataType: 'json',
    headers: {  'Access-Control-Allow-Origin': '*' },
    success: function(data) {
      alert(data); // show response from the php script.
    }
  });
}
