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
    verifyEmail: function(email,callback){

      $.ajax({
        type: "POST",
        url: "/api/account/verify",
        data: { email: email }
      }).done( callback ).fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/account/verify: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    createAccount: function(token,cn,sn,email,password,confirmPassword, callback) {

      $.ajax({
        type: "POST",
        url: "/api/account/create",
        data: { token:token, cn:cn, sn:sn, email: email, password: password, confirmPassword: confirmPassword }
      }).done( callback ).fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/account/create: " + textStatus );
      });
    },
    ///////////////////////////////////////////////////////////////////////
    login: function(email,password,callback){

      $.ajax({
        type: "POST",
        url: "/api/account/login",
        data: {email:email, password:password}
      }).done( callback ).fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/account/login: " + textStatus );
      });
    },
    ///////////////////////////////////////////////////////////////////////
    logoff: function(callback) {

      $.ajax({
        type: "POST",
        url: "/api/account/logoff"
      }).done( callback ).fail( function( jqXHR, textStatus ) {
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

            /*jshint multistr: true */
            $("#campaignDiv").html( $("#campaignDiv").html()+"<div class='row' id='"+msg.campaignId+"'> \
                                                                <div class='col-md-4'>  \
                                                                  <a href='/gameon/?gmId="+msg.accountId+"&campaignId="+msg.campaignId+"'> \
                                                                    <span class='glyphicon glyphicon-play'></span>"+$("#inputCampaignName").val()+"</a> \
                                                                </div> \
                                                                <div class='col-md-8'> \
                                                                    <span class='glyphicon glyphicon-remove' onclick=\"javascript:portal.deleteCampaign('"+msg.campaignId+"');\"></span> \
                                                                </div> \
                                                              </div>");

            // It cleans input field
            $("#inputCampaignName").val("");

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
    deleteCampaign: function(campaignId){

      $.ajax({
        type: "POST",
        url: "/api/campaign/delete",
        data: {campaignId: campaignId},
      }).done(function(msg){

        if( msg.ok ){

          $("#"+campaignId).remove();

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
