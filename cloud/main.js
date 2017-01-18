Parse.serverURL = 'https://weightsndates-server-dev.herokuapp.com:1337/parse';

//var Parse = require('parse-cloud-express').Parse;

//For additional JS file support call require('cloud/mainSplit.js');

// Send pushes block

Parse.Cloud.define('CloudSendToDevice', function (request, response) {
    console.log('Run cloud function to forward message to user');
    // As with Parse-hosted Cloud Code, the user is available at: request.user
    // You can get the users session token with: request.user.getSessionToken()
    // Use the session token to run other Parse Query methods as that user, because
    //   the concept of a 'current' user does not fit in a Node environment.
    //   i.e.  query.find({ sessionToken: request.user.getSessionToken() })...

    var token = request.user.getSessionToken();
    //request.params.get
    //var testObjectId = request.user.getSess;

    //response.success("Hello world! " + (request.params.a + request.params.b));

    Parse.Push.send({
        where: query,
        data: {
            alert: 'Check Send',
            badge: 1,
            sound: 'default'
        }
    }, {
        useMasterKey: true,
        success: function () {
            // Push sent!
            response.success("OK");
        },
        error: function (error) {
            // There was a problem :(
            response.error(error);
        }
    });

});

Parse.Cloud.beforeSave('CloudMatchWithUser', function (request) {

    console.log('Run cloud function to match with user ' + request.likedUserId + ' fbId=' + request.fbId + ' like=' + request.params.like);

    var query = new Parse.Query(Parse.User);

    if (request.params.like) {
        //request.object.id
        query.contains("likedUsers", request.fbId).equalTo("objectId", request.likedUserId);

        var success = "success";
        var fail = "failure";
        var successTemporary = "Temporary success response on Like = False";
        var jsonSuccessObject = {
            "answer": success
        };
        var jsonSuccessTemporaryObject = {
            "answer": successTemporary
        };

        var jsonFailObject = {
            "answer": fail
        };

        console.log('Cloud Match Before Find');

        query.find({
            success: function (results) {
                console.log('Matched');

                response.success(jsonSuccessObject);

                //.then call CloudShowMatchWithUser
            },
            error: function () {
                console.log('No match');
                response.error(jsonFailObject);
            }, useMasterKey: true
        }, {useMasterKey: true});//,

    } else {
        //[[PFUser currentUser] addObject:user[@"fbid"] forKey:@"viewedUsers"];
        //query.insert
        console.log('Cloud Match: Temporary success response on Like = False');
        response.success(jsonSuccessTemporaryObject);
    }

});

Parse.Cloud.afterSave('CloudShowMatchWithUser', function (request) {

    //Create conversation with status active

    // For this user send push
    // NSDictionary *data=@{@"alert":[NSString stringWithFormat:@"You and %@ are a match!", [PFUser currentUser][@"firstName"]], @"badge":@"Increment", @"sound":@"default", @"WDPushType":@"WDPushTypeMatch"};

    var query = new Parse.Query(Parse.Conversation);

    var Conversation = Parse.Object.extend("Conversation");
    var conversationObject = new Conversation();
    conversationObject.save({fromUser: request.user});

    //conversation=[PFObject objectWithClassName:@"Conversation"];
    //[conversation setObject:[PFUser currentUser] forKey:@"fromUser"];
    //[conversation setObject:user forKey:@"toUser"];
    //[conversation setObject:@(WDConversationStatusActive) forKey:@"status"];

    //user == user.objectId

});

//fbid 598736206971991


/*
 * Method to
 *
 * Android usage:
 HashMap<String,String> map = new HashMap<String, String>();
 map.put("PARAM1KEY","PARAM1VALUE");
 // here you can send parameters to your cloud code functions
 // such parameters can be the channel name, array of users to send a push to and more...

 ParseCloud.callFunctionInBackground("SendPush",map, new FunctionCallback<Object>() {

 @Override
 public void done(Object object, ParseException e) {
 // handle callback
 }
 });
 * */

Parse.Cloud.define('CloudSendPush', function (request) {

    console.log('Run cloud function CloudSendPush');
    var query = new Parse.Query(Parse.Installation);
    console.log('Run cloud function. query prepared');
    query.equalTo('user', 'hqSx15fNoO');

    //var itemQuery = new Parse.Query('Item');
    //itemQuery.equalTo('name', request.params.itemName);
    // here you can add other conditions e.g. to send a push to specific users or channel etc.

    console.log('Run cloud function. Equal prepared');
    var payload = {
        alert: 'Message to device',
        badge: 1,
        sound: 'default'
    };

    console.log('Run cloud function. payload prepared');
    Parse.Push.send({
        data: payload,
        where: query

    }, {
        useMasterKey: true
    })
        .then(function () {
            console.log('Run cloud function. Ok');
            response.success("Push Sent!");
        }, function (error) {
            console.log('Run cloud function. Error ' + error.message);
            response.error("Error while trying to send push " + error.message);
        });

    console.log('Run cloud function. CloudSendPush End');
});

/*
 * Method to send Message to all Android devices
 * Test from CURL
 * curl -X POST -H "X-Parse-Application-Id: 7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt" -H "X-Parse-REST-API-Key: yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh"  -H "Content-Type: application/json" -d "{\"action\": \"SEND_PUSH\", \"message\": \"Hello Android\", \"customData\": \"Android Data\"}"  https://weightsndates-server-dev.herokuapp.com/parse/classes/CloudPushChannelPipe
 * */
Parse.Cloud.define('CloudPushChannelPipe', function (request, response) {

    // request has 2 parameters: params passed by the client and the authorized user
    // var params = request.params;
    // var user = request.user; // request.user replaces Parse.User.current() // https://github.com/ParsePlatform/parse-server/wiki/Compatibility-with-Hosted-Parse
    // var token = user.getSessionToken(); // get session token from request.user

    // extract out the channel to send
    var action = params.action;
    var message = params.message;
    var customData = params.customData;

    // use to custom tweak whatever payload you wish to send
    var pushQuery = new Parse.Query(Parse.Installation);
    //pushQuery.equalTo("deviceType", "android");
    pushQuery.equalTo("objectId", "hqSx15fNoO");

    var payload = {
        "data": {
            "alert": message,
            "action": action,
            "customdata": customData
        }
    };

    // Note that useMasterKey is necessary for Push notifications to succeed.
    var text = "success";
    var jsonObject = {
        "answer": text
    };

    Parse.Push.send({
        data: payload,
        where: pushQuery,      // for sending to a specific channel                                                                                                                                 data: payload,
    }, {
        success: function () {
            console.log("PushChannelPipe PUSH OK");
            response.success(jsonObject);
        }, error: function (error) {
            console.log("PushChannelPipe PUSH ERROR" + error.message);
            response.success("PushChannelPipe PUSH ERROR" + error.message);
        }, useMasterKey: true
    });



});


Parse.Cloud.define('CloudMatchWithUser', function (request) {

    var query = new Parse.Query(Parse.Installation);
    query.exists("deviceToken");
    //var itemQuery = new Parse.Query('Item');
    //itemQuery.equalTo('name', request.params.itemName);
    // here you can add other conditions e.g. to send a push to specific users or channel etc.

    var payload = {
        alert: "Message to device"
    };


    Parse.Push.send({
        data: payload,
        where: query
    }, {
        useMasterKey: true
    })
        .then(function () {
            response.success("Push Sent!");
        }, function (error) {
            response.error("Error while trying to send push " + error.message);
        });
});

Parse.Cloud.define('CloudUsersRequest', function (request) {

    var query = new Parse.Query(Parse.Installation);
    query.exists("deviceToken");
    //var itemQuery = new Parse.Query('Item');
    //itemQuery.equalTo('name', request.params.itemName);
    // here you can add other conditions e.g. to send a push to specific users or channel etc.

    var payload = {
        alert: "Message to device"
    };


    Parse.Push.send({
        data: payload,
        where: query
    }, {
        useMasterKey: true
    })
        .then(function () {
            response.success("Push Sent!");
        }, function (error) {
            response.error("Error while trying to send push " + error.message);
        });
});


//CHAT BLOCK

//chat message on conversation on before save
Parse.Cloud.beforeSave('CloudProcessChatMessage', function (request, response) {
    var comment = request.object.get("message");

    //CHECK SIZE AND SET MESSAGE SHORTER if it so big before SAVE
    if (comment.length > 1000) {
        // Truncate and add a ...
        request.object.set("message", comment.substring(0, 999) + "...");
    }
    response.success();
});


//BASIC TEST BLOCK

Parse.Cloud.beforeSave('CloudTestObject', function (request, response) {
    console.log('Ran beforeSave on objectId: ' + request.object.id);
    // if update the request object, we need to send it back with the response
    response.success(request.object);
});

Parse.Cloud.afterSave('CloudTestObject', function (request, response) {
    console.log('Ran afterSave on objectId: ' + request.object.id);
});

Parse.Cloud.beforeDelete('CloudTestObject', function (request, response) {
    console.log('Ran beforeDelete on objectId: ' + request.object.id);
    response.success();
});

Parse.Cloud.afterDelete('CloudTestObject', function (request, response) {
    console.log('Ran afterDelete on objectId: ' + request.object.id);
});

Parse.Cloud.define('CloudHello', function (request, response) {
    console.log('Run cloud function.');
    // As with Parse-hosted Cloud Code, the user is available at: request.user
    // You can get the users session token with: request.user.getSessionToken()
    // Use the session token to run other Parse Query methods as that user, because
    //   the concept of a 'current' user does not fit in a Node environment.
    //   i.e.  query.find({ sessionToken: request.user.getSessionToken() })...
    response.success("Hello world! From Cloud");
});
