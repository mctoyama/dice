//--------------------------------------------------------------------------------
// Copyright 2015 Marcelo Costa Toyama
//
// This file is part of PixelnDice.
//
//    PixelnDice is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    any later version.
//
//    PixelnDice is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with PixelnDice.  If not, see <http://www.gnu.org/licenses/>.
//
//--------------------------------------------------------------------------------

var portal = (function(){

  return {

    ///////////////////////////////////////////////////////////////////////
    // uid4 generator function
    UUID: function() {
      // http://www.ietf.org/rfc/rfc4122.txt
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
	s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      
      var uuid = s.join("");
      return uuid;
    },

    ///////////////////////////////////////////////////////////////////////
    createAccount: function(email,password,confirmPassword, callback) {
      
      $.ajax({
	type: "POST",
	url: "/api/account/create",
	data: { email: email, password: password, confirmPassword: confirmPassword }
      })
      .done( callback )
      .fail( function( jqXHR, textStatus ) {
		    console.log(" Request failed: /api/account/create: " + textStatus );
 		  });
      
    },

    ///////////////////////////////////////////////////////////////////////
    login: function(email,password,callback){

      $.ajax({
	type: "POST",
	url: "/api/account/login",
	data: {email:email, password:password}
      })
	    .done( callback )
	    .fail( function( jqXHR, textStatus ) {
	      console.log(" Request failed: /api/account/login: " + textStatus );
 	    });	    

      
    },
    ///////////////////////////////////////////////////////////////////////
    logoff: function(callback) {
      
      $.ajax({
	type: "POST",
	url: "/api/account/logoff"
      })
	    .done( callback )
	    .fail( function( jqXHR, textStatus ) {
	      console.log(" Request failed: /api/account/logoff: " + textStatus );
 	    });	    

    },

    ///////////////////////////////////////////////////////////////////////
    // new campaign
    submitNewCampaign: function() {

      if( $("#inputCampaignName").val() !== "" && $("#inputCampaignName").val() !== undefined && $("#inputCampaignName").val() !== null ){

	$.ajax({
	  type: "POST",
	  url: "/api/campaign/create",
	  data: {name:$("#inputCampaignName").val()},
	}).done(function(msg){

	  if( msg.ok ){

	    var uuid = portal.UUID();
	    
	    $("#campaignDiv").html( $("#campaignDiv").html()+"<div class='row' id='"+uuid+"'> \
                                                	        <div class='col-md-4'>  \
				                                  <a href='/gameon/?gm="+encodeURI(email)+"&campaign="+encodeURI($("#inputCampaignName").val())+"'> \
                                                 	            <span class='glyphicon glyphicon-play'></span>"+$("#inputCampaignName").val()+"</a> \
                                                                </div> \
                                                                <div class='col-md-8'> \
                                                                    <span class='glyphicon glyphicon-remove' onclick=\"javascript:portal.deleteCampaign('"+uuid+"','"+$("#inputCampaignName").val()+"');\"></span> \
                                                                </div> \
                        		                      </div>");
	  }else{
	    console.log("Error creating campaign - "+msg.err);
	  }
	  

	}).fail(function (msg) {
	  console.log("Error creating campaign - service unavaliable");
	});
	
      }
      
    },
    ///////////////////////////////////////////////////////////////////////
    // delete campaign
    deleteCampaign: function(id,campaignName){

      $.ajax({
	type: "POST",
	url: "/api/campaign/delete",
	data: {name: campaignName},
      }).done(function(msg){
	
	if( msg.ok ){
	  
	  $("#"+id).remove();
	    
	}else{
	  console.log("Error deleting campaign - "+campaignName);
	}

      }).fail(function (msg) {
	console.log("Error deleting campaign - service unavaliable");
      });

    },
  };

}());

///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
