function changeimg(url){
    document.getElementById('main-imgg').src=url;
    document.getElementById('main-imgg').setAttribute('data-zoom',url)
}

const demoTrigger = document.querySelector('.demo-trigger');
const paneContainer = document.querySelector('.detail');

new Drift(demoTrigger, {
  paneContainer: paneContainer,
  inlinePane: false,
  zoomFactor: 2,
});

