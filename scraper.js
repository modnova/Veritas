/*
Importany Article Information
-------------------------------
0:title
1:link
2:descr
3:website
4:verified/unverified
//5:This attribute will be used to determine whether a card has been evaluated or not  true / false
*/


//Current url of the page used to determine which scrape to use
var currentUrl = "" + window.location.href;
currentUrl = currentUrl.toLowerCase();
//console.log(currentUrl);
//Set of arrays containing all of the article information on a page
var feed = new Set();


function twitterScrape() {
    var tweets = document.getElementsByClassName('stream-items js-navigable-stream');
    //console.log(tweets);
    var cards = tweets[0].childNodes;
    //console.log(cards);
    for (var i = 1; i < document.getElementsByClassName('card2 js-media-container').length; i++) {
        var info = new Array(5);
        var tweet = cards[i];
        //console.log(tweet);
        //console.log(document.getElementsByClassName('js-tweet-text-container')[i].innerText);
        //info[0]=document.getElementsByClassName('js-tweet-text-container')[i];
        var text = document.getElementsByClassName('js-tweet-text-container')[i].innerText;
        //info[0]=text;
        info[1] = null;
        info[2] = null;
        // js-openLink u-block TwitterCardsGrid-col--12 TwitterCard-container TwitterCard-container--clickable SummaryCard--large
        //TwitterCardsGrid-col--12 TwitterCardsGrid-col--spacerBottom CardContent
        //SummaryCard-content
        if (cards[i].lastChild.lastElementChild.firstElementChild.firstChild !== null)
            info[3] = cards[i].lastChild.lastElementChild.firstElementChild.firstChild.data;
        else {
            info[3] = "";
        }

        //console.log(info[3]);
        feed.add(info);

    }
    console.log(feed);

}

function redditScrape() {
    //master html table of all the cards
    var cards = document.getElementById('siteTable').getElementsByClassName('thing');
    //console.log(cards);
    for (var i = 0; i < cards.length; i++) {
        //array to hold info
        var info = new Array(5);
        //console.log(cards[i]);
        var text = cards[i].innerText;
        //console.log(text);
        var title = "";
        var website = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
        //Deletes irrelevant lines
        text = text.substring(text.indexOf("\n") + 1);
        text = text.substring(text.indexOf("\n") + 1);
        //Loop to populate title leaving out the last part
        for (var j = 0; j < text.length; j++) {
            var ch = text.charAt(j);

            if (ch == '(') {
                break;
            } else
                title = title + ch;
        }
        info[0] = title;
        //console.log(title);
        var link = cards[i].getAttribute("data-url");
        //console.log(cards[i].getAttribute("data-url"));
        info[1] = link;
        //There's no descriptions for reddit posts
        info[2] = null;
        info[3] = website;
        //console.log(website);
        feed.add(info);
    }
    console.log(feed);

}

//Gets info then puts it into array then puts into Set
function fbScrape() {

    //Type: HTMLCollection
    //Represents: Sections of the Cards that are news articles
    var cards = document.getElementsByClassName('_6m3 _--6');

    //console.log(cards);

    for (var i = 0; i < cards.length; i++) {
        //Stores the information in an array
        var info = new Array(5);

        //Title
        info[0] = cards[i].childNodes[0].innerText;


        //link
        if (cards[i].nextSibling !== null) {
            if (cards[i].nextSibling.href.includes("https://l.facebook.com/l.php?u=") || cards[i].nextSibling.href.includes("http://l.facebook.com/l.php?u=")) {
                var Fburl = cards[i].nextSibling.href;
                Fburl = Fburl.replace("https://l.facebook.com/l.php?u=", "").replace("http://l.facebook.com/l.php?u=", "").replace(/%3A/gi, ":").replace(/%F/gi, "/").replace(/%2F/gi, "/");
                Fburl = Fburl.substring(0, Fburl.indexOf("&h="));
                info[1] = Fburl;
            } else
                info[1] = cards[i].nextSibling.href;
        } else
            info[1] = null;



        //Description
        if (cards[i].childNodes[1].className.includes("hidden_elem"))
            info[2] = null;
        else
            info[2] = cards[i].childNodes[1].innerText;

        //website
        if (cards[i].lastChild.lastElementChild.firstElementChild.firstChild !== null)
            info[3] = cards[i].lastChild.lastElementChild.firstElementChild.firstChild.data;
        else {
            info[3] = "";
        }

        if (!feed.has(info)) {
            feed.add(info);
        }
    }

    //console.log(feed);

}

function determineValidity() {
    //loop through set
    for (let value of feed) {
        var link;
        if (value[3] !== "") {
            link = value[3];
        } else {
            link = value[1];
        }
        $.getJSON('https://veritas1.herokuapp.com/content/get/', {
            url: link
        }, function(data, jqXHR) {
            // populate the last field in the array
            value[4] = (data.response);
            //CHECK TO SEE IF FACEBOOK
            HighlighterFb();
        });

    }
}

function HighlighterFb() {
    //console.log(feed);
    var cards = document.getElementsByClassName('_6m3 _--6');
    var i = 0;
    for (let value of feed) {
        if (i >= cards.length)
            break;
        var x = document.createElement("H1");
        var title = "" + cards[i].childNodes[0].innerText;
        cards[i].childNodes[0].innerText = "";
        x.id = 'id' + i;
        //Verified just gets veritas font. Subtle

        if (value[4] == "verified") {
            x.style.color = "green";
            x.style.fontSize = "16px";
            x.style.fontFamily = "Tahoma";
        }
        //Not verified gets red highlight
        else if (value[4] == "unverified") {
            x.style.color = "red";
            x.style.fontSize = "16px";
            x.style.fontFamily = "Tahoma";
            //  x.style.textAlign = "center";
        }
        x.append("" + title);
        if ($('#id' + i).length === 0) {
            cards[i].childNodes[0].append(x);
        }
        i++;
    }
}

function buttonMakerReddit() {

}

function buttonMakerTwitter() {

}
$(document).ready(function() {
    //fills the feed
    if (currentUrl.includes("facebook")) {
        fbScrape();
        determineValidity();
        console.log(feed);
    } else if (currentUrl.includes("reddit")) {
        redditScrape();
        determineValidity();
        //buttonMakerReddit();
    } else if (currentUrl.includes("twitter")) {
        twitterScrape();
        determineValidity();
        //buttonMakerTwitter();
    }
});

//Function that detects somebody scrolling and stop scrolling
$.fn.scrollEnd = function(callback, timeout) {
    $(this).scroll(function() {
        var $this = $(this);
        if ($this.data('scrollTimeout')) {
            clearTimeout($this.data('scrollTimeout'));
        }
        $this.data('scrollTimeout', setTimeout(callback, timeout));
    });
};

// how to call it (with a 1000ms timeout):
$(window).scrollEnd(function() {
    //alert('stopped scrolling');
    feed.clear();

    if (currentUrl.includes("facebook")) {
        fbScrape();
        determineValidity();
        HighlighterFb();
    } else if (currentUrl.includes("reddit")) {
        redditScrape();
        determineValidity();
        //buttonMakerReddit();
    } else if (currentUrl.includes("twitter")) {
        twitterScrape();
        determineValidity();
        //buttonMakerTwitter();
    }
}, 1000);
