/*
Importany Article Information
-------------------------------
0:title
1:link
2:descr
3:website
*/

//Set of arrays containing all of the article information on a page
var feed = new Set();

//Gets info then puts it into array then puts into Set
function scrape() {

  //Type: HTMLCollection
  //Represents: Sections of the Cards that are news articles
  cards = document.getElementsByClassName('_6m3 _--6');

  console.log(cards);

  for(var i=0;i<cards.length;i++)
  {
    //Stores the information in an array
    var info = new Array(4);

    //Title
    info[0] = cards[i].childNodes[0].innerText;

    //link
    if(cards[i].nextSibling !== null)
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
    info[3] = cards[i].lastChild.lastElementChild.firstElementChild.firstChild.data;

    if(!feed.has(info)) {
      feed.add(info);
    }
  }

  console.log(feed);

}


$(document).ready(function(){
  scrape();
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
    scrape();
}, 1000);
