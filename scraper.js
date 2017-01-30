/*
Importany Article Information
-------------------------------
0:title
1:link
2:descr
3:website
4:verified/unverified
5:WoT Info
//5:This attribute will be used to determine whether a card has been evaluated or not  true / false
*/


//Current url of the page used to determine which scrape to use
var currentUrl = "" + window.location.href;
currentUrl = currentUrl.toLowerCase();
//console.log(currentUrl);
//Set of arrays containing all of the article information on a page
var feed = new Set();


function twitterScrape() {
    var frames = window.frames;
    var iframe;
    var link;
    for (var i = 0; i < frames.length; i++) {
        var info = new Array(5);
        iframe = frames[i].frameElement;
        iframe = iframe.contentDocument || iframe.contentWindow.document;
        //console.log(iframe);
        link = iframe.getElementsByClassName('SummaryCard-content')[0];
        if (typeof link != 'undefined') {
            console.log(link);
            //link = link.childNodes[3];
            link = link.getElementsByClassName('u-block TwitterCardsGrid-col--spacerTop SummaryCard-destination')[0];
            console.log(link.innerText);
            info[0] = null;
            info[1] = link.innerText;
            info[2] = null;
            info[3] = link.innerText;
            info[4] = null;
        }

    }

    feed.add(info);
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
        if (value[3] === "" || value[3] === undefined) {
            link = value[1];
        } else {
            link = value[3];
        }
        $.getJSON('https://veritas1.herokuapp.com/content/get/', {
            url: link
        }, function(data, jqXHR) {
            // populate the last field in the array
            value[4] = (data.status);
            value[5] = (data.wotinfo);
            //CHECK TO SEE IF FACEBOOK
            if (currentUrl.includes("facebook")) {
                highlighterFb();
            } else if (currentUrl.includes("reddit")) {
                highlighterReddit();
            } else if (currentUrl.includes("twitter")) {
                highlighterTwitter();
            }
        }, {
            async: false
        });

    }
}

function highlighterFb() {
    var cards = document.getElementsByClassName('_6m3 _--6');
    var i = 0;
    for (let value of feed) {
        if (i >= cards.length)
            break;

        var verification = false;
        if (value[4] == "verified" && (value[5] == "excellent" || value[5] == "good")) {
            verification = true;
        } else {
            verification = false;
        }
        var x = document.createElement("H1");
        var title = "" + cards[i].childNodes[0].innerText;
        cards[i].childNodes[0].innerText = "";
        x.id = 'id' + i;


        //Green Highlight for verified
        if (value[4] == "verified" && (value[5] == "excellent" || value[5] == "good")) {
            x.style.color = "green";
            x.style.fontSize = "16px";
            x.style.fontFamily = "Tahoma";
        }
        //Not verified gets red highlight
        else {
            x.style.color = "red";
            x.style.fontSize = "16px";
            x.style.fontFamily = "Tahoma";
        }
        x.append("" + title);

        if ($('#id' + i).length === 0) {
            cards[i].childNodes[0].append(x);
        }

        i++;
    }
}

function highlighterReddit() {
    var i = 0;
    var cards = document.getElementById('siteTable').getElementsByClassName('thing');
    for (let value of feed) {
        if (i >= cards.length) {
            break;
        }
        cards[i].id = "veritas" + i;
        if (value[4] == "verified") {
            document.getElementById("veritas" + i).childNodes[4].childNodes[0].childNodes[0].style.color = "green";

        }
        //Not verified gets red highlight
        else if (value[4] == "unverified") {
            document.getElementById("veritas" + i).childNodes[4].childNodes[0].childNodes[0].style.color = "red";
        }
        i++;
    }
}

function highlighterTwitter() {

    var frames = window.frames;
    var iframe;
    var i = 0;
    for (let value of feed) {
        iframe = frames[i].frameElement;
        iframe = iframe.contentDocument || iframe.contentWindow.document;
        console.log(value[4]);
        console.log(value[4] == "verified");
        if (value[4] == "verified") {

            iframe.getElementsByTagName('head')[0].append('<link rel="stylesheet" type="text/css" href="twitter_style.css">');
        } else {
            //iframe.getElementsByTagName('head')[0].append('<link rel="stylesheet" type="text/css" href="twitter_style_unverified.css">');
        }
        i++;
    }

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
        highlighterReddit();
    } else if (currentUrl.includes("twitter")) {
        twitterScrape();
        determineValidity();
        highlighterTwitter();
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
        highlighterFb();
    } else if (currentUrl.includes("reddit")) {
        redditScrape();
        determineValidity();
        highlighterReddit();
    } else if (currentUrl.includes("twitter")) {
        twitterScrape();
        determineValidity();
        highlighterTwitter();
    }
}, 1000);
