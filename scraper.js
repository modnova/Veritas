/*
Importany Article Information
-------------------------------
0:title
1:link
2:descr
3:website
*/
//Current url of the page used to determine which scrape to use
var currentUrl=""+window.location.href;
currentUrl=currentUrl.toLowerCase();
console.log(currentUrl);
//Set of arrays containing all of the article information on a page
var feed = new Set();

function redditScrape()
{
  //master html table of all the cards
 var cards=document.getElementsByClassName('sitetable linklisting')[0];
 var j=0;
 //loop is weird because cards doesnt have a length and i increment by 2 because theres a spacer between each card
 for(var i=0;i<8;i=i+2)
  {
    //array to hold info
    var info=new Array(4);
    //current card
    var card=cards.childNodes[i];
    console.log(card);
    //trying to get the title
    console.log(document.getElementsByClassName('title')[0].innerText)
    var title=card;
    console.log(document.getElementsByClassName('title may-blank loggedin outbound')[j].innerText);
    j++;
  }
}

//Gets info then puts it into array then puts into Set
function fbScrape() {

  //Type: HTMLCollection
  //Represents: Sections of the Cards that are news articles
  cards = document.getElementsByClassName('_6m3 _--6');

  //console.log(cards);

  for(var i=0;i<cards.length;i++)
  {
    //Stores the information in an array
    var info = new Array(4);

    //Title
    info[0] = cards[i].childNodes[0].innerText;

    //link
    if(cards[i].nextSibling!==null)
    {
      if(cards[i].nextSibling.href.includes("https://l.facebook.com/l.php?u=") || cards[i].nextSibling.href.includes("http://l.facebook.com/l.php?u="))
      {
        var Fburl = cards[i].nextSibling.href;
        Fburl = Fburl.replace("https://l.facebook.com/l.php?u=", "").replace("http://l.facebook.com/l.php?u=", "").replace(/%3A/gi, ":").replace(/%F/gi, "/").replace(/%2F/gi, "/");
        Fburl = Fburl.substring(0,Fburl.indexOf("&h="));
        info[1] = Fburl;
      }
    else
      info[1] = cards[i].nextSibling.href;
    }
    else
      info[1]=null;



    //Description
    if(cards[i].childNodes[1].className.includes("hidden_elem"))
      info[2] = null;
    else
      info[2] = cards[i].childNodes[1].innerText;

    //website
    if(cards[i].lastChild.lastElementChild.firstElementChild.firstChild!==null)
      info[3] = cards[i].lastChild.lastElementChild.firstElementChild.firstChild.data;

    if(!feed.has(info)) {
      feed.add(info);
    }
  }

  console.log(feed);

}


$(document).ready(function(){
  //Current url of the page used to determine which scrape to use

  if(currentUrl.includes("facebook"))
    fbScrape();
  else if(currentUrl.includes("reddit"))
    redditScrape();

});

//Function that detects somebody scrolling and stop scrolling
$.fn.scrollEnd = function(callback, timeout) {
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback,timeout));
  });
};

// how to call it (with a 1000ms timeout):
$(window).scrollEnd(function(){
    //alert('stopped scrolling');
    feed.clear();
    if(currentUrl.includes("Facebook"))
      fbScrape();
    else if(currentUrl.includes("Reddit"))
      redditScrape();
}, 1000);
