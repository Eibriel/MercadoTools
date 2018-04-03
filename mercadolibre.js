/**
 * JavaScript Get URL Parameter
 *
 * @param String prop The specific URL parameter you want to retreive the value for
 * @return String|Object If prop is provided a string value is returned, otherwise an object of all properties is returned
 */
function getUrlParams( prop ) {
    var params = {};
    var search = decodeURIComponent( window.location.href.slice( window.location.href.indexOf( '#' ) + 1 ) );
    var definitions = search.split( '&' );

    definitions.forEach( function( val, key ) {
        var parts = val.split( '=', 2 );
        params[ parts[ 0 ] ] = parts[ 1 ];
    } );

    return ( prop && prop in params ) ? params[ prop ] : params;
}

access_token = getUrlParams("access_token");
getUrlParams("expires_in");
getUrlParams("domains");

full_data = {};
full_data['orders'] = null;

function refresh() {
    $("#nickname").html(full_data['nickname']);
    //for (var n in full_data['orders']['results']) {
    //    $("#orders").html(full_data['orders']['results'][n]['buyer']['id']);
    //}
}

function pr_users_me(data) {
    full_data['nickname'] = data['nickname'];
    full_data['id'] = data['id'];
    console.log( full_data );
    refresh();
}

function pr_orders(data) {
    full_data['orders'] = data['results'];
    refresh();
}

function get_mercadolibre(url, data, process_function, functions, functions_params) {
    $.ajax({
      method: "GET",
      url: url,
      data: data
    }).done(function( msg ) {
        console.log( msg );
        process_function(msg);
        if (functions) {
            for (var fun in functions) {
                functions[fun].apply(this, functions_params[fun]);
            }
        }
    });
}

function get_user_data() {
    params = {
        "access_token": access_token
    }
    get_mercadolibre("https://api.mercadolibre.com/users/me", params, pr_users_me);
}

function orders_csv() {
    csv_string = "buyer_nickname,buyer_email,buyer_name,buyer_tel,item_title,status,total_amount"
    for (var ord in full_data['orders']) {
        current_order = full_data['orders'][ord]
        //
        buyer_nickname = current_order['buyer']['nickname'];
        buyer_email = current_order['buyer']['email'];
        buyer_name = current_order['buyer']['first_name'] + " " + current_order['buyer']['last_name'];
        buyer_tel = current_order['buyer']['phone']['area_code'] + " " + current_order['buyer']['phone']['number'];
        status = current_order['status'];
        total_amount = current_order['total_amount'];
        //
        for (var item in current_order['order_items']) {
            //
            item_title = current_order['order_items'][item]['item']['title']
            //
            csv_string += "\n"
            csv_string += buyer_nickname+","+buyer_email+","+buyer_name+","+buyer_tel+","+item_title+","+status+","+total_amount
        }
    }
    return csv_string
}

function create_file(this_) {
    var csv_string = orders_csv();
    $("#dummy_a").attr("href", "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_string));
    // console.log("Downloading...");
    $("#dummy_a").trigger( "click" );
    $("#dummy_a").html( "Descargar Ventas Recientes" );
}

function download_recent_orders(this_) {
    params = {
        "seller": full_data['id'],
        "access_token": access_token,
        "sort": "date_desc",
    }
    functions = [create_file]
    functions_params = [[this_]]
    get_mercadolibre("https://api.mercadolibre.com/orders/search", params, pr_orders, functions, functions_params);
    //return false;
}

get_user_data();
