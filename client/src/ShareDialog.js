/* eslint-disable */ 
import React, { Component } from 'react';
        
import {InlineShareButtons} from 'sharethis-reactjs';

//import {
  //FacebookShareButton
//} from 'react-share';


//import Email from 'react-icons/lib/fa/envelope-o';
//import Twitter from 'react-icons/lib/fa/twitter';
//import Facebook from 'react-icons/lib/fa/facebook';

export default class ShareDialog extends Component {
    
    
    componentDidMount() {
		window.twttr = (function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0],
			t = window.twttr || {};
		  if (d.getElementById(id)) return t;
		  js = d.createElement(s);
		  js.id = id;
		  js.src = "https://platform.twitter.com/widgets.js";
		  fjs.parentNode.insertBefore(js, fjs);

		  t._e = [];
		  t.ready = function(f) {
			t._e.push(f);
		  };

		  return t;
		}(document, "script", "twitter-wjs"));
	}
    //<div id="fb-root"></div>
				
    render() { 
		let that = this;
		let encodedShareLink = encodeURIComponent(this.props.shareLink)   //.replace(/ /g,'_')
		let mailToLink = "mailto:?subject="+encodeURIComponent(this.props.shareText)+"&body="+encodedShareLink;
	    return  (
            <div id="sharedialog" onClick={() => this.props.setShareDialog(false)} className="modaldialog" tabIndex="-1" role="dialog">
				<div id="fb-root"></div>
				<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v4.0&appId=704362873350885&autoLogAppEvents=1"></script>

				<div className="modaldialog-dialog" role="document">
					<div className="modaldialog-content">
					  <div className="modaldialog-header">
						<button style={{color:'white'}} type="button" className="close" aria-label="Close" onClick={() => this.props.setShareDialog(false)}>
						  <span aria-hidden="true">&times;</span>
						</button>
						<h5 className="modaldialog-title">{this.props.dialogTitle ? this.props.dialogTitle : 'Share using'}</h5>
						
					  </div>
				      <div className="modaldialog-body">
						<div>{this.props.shareText}</div>
						<div style={{marginBottom: '2em'}}>{this.props.shareLink}</div>
						
				
						<div className='btn btn-info' ><a className="twitter-share-button"
						  target="_blank" 
						  data-size="large"
						  data-text={this.props.shareText}
						  data-url={this.props.shareLink}
						  href="https://twitter.com/intent/tweet"
						  data-via={this.props.twitterVia ? this.props.twitterVia : ''}
						  >
						Tweet</a></div>
				


						<a style={{marginLeft:'1em'}} className="btn btn-info"
						  target="_blank" 
						  href={mailToLink} >Email</a>
					
					
					
					  </div>
					</div>
				</div>
			</div>
            
        )
    };
    
}



						//<button className='btn btn-info' onClick={() => {
							//FB.ui({
							  //method: 'share',
							  //href: that.props.shareLink,
							  //quote: that.props.shareText,
							  //hashtag: 'MnemosLibrary'
							//}, function(response){});
						//}} >Facebook</button>

						//<div class="fb-share-button" data-hashtag="MnemosLibrary" data-quote={this.props.shareText} data-href={this.props.shareLink} data-layout="button" data-size="large"><a target="_blank" href={'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(this.props.shareLink)+'&amp;src=sdkpreparse'} class="fb-xfbml-parse-ignore">Share</a></div>


	//href={"https://twitddter.com/intent/tweet?text="+encodeURIComponent(this.props.shareText)+"%20"+encodedShareLink}
						  
						  
		//<script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.3&appId=704362873350885&autoLogAppEvents=1"></script>
								
		//<FacebookShareButton url={this.props.shareLink} quote={this.props.shareText} hashtag={'MnemosLibrary'} >Share</FacebookShareButton>
		
						//<div className='btn btn-info' >
							//<iframe src={"https://www.facebook.com/plugins/share_button.php?href=" + encodedShareLink + "&layout=button&size=large&appId=704362873350885&width=73&height=28"} width="73" height="28" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
						//</div>
						
											
	//<InlineShareButtons config={{
							//alignment: 'center',  // alignment of buttons (left, center, right)
							//color: 'social',      // set the color of buttons (social, white)
							//enabled: true,        // show/hide buttons (true, false)
							//font_size: 16,        // font size for the buttons
							//labels: null,        // button labels (cta, counts, null)
							//language: 'en',       // which language to use (see LANGUAGES)
							//networks: [           // which networks to include (see SHARING NETWORKS)
							  //'email',
							  //'twitter','facebook',
							  ////'linkedin','pinterest',
							  //// 'print','sms',
							  ////'whatsapp','messenger',
							  ////'reddit',  'stumbleupon', 'tumblr','flipboard','livejournal',
							 ////   'xing','mailru','vk', 'meneame', 'oknoklassniki', 'wechat', 'weibo'
								////  'sharethis'
							  
							//],
							//padding: 12,          // padding within buttons (INTEGER)
							//radius: 4,            // the corner radius on each button (INTEGER)
							//show_total: false,
							//size: 60,
							////,             // the size of each button (INTEGER)
				 
							//// OPTIONAL PARAMETERS
							//url: this.props.url ? this.props.url : null, // (defaults to current url)
							//image: this.props.image ? this.props.image : null,  // (defaults to og:image or twitter:image)
							//description: this.props.description ? this.props.description : null,       // (defaults to og:description or twitter:description)
							//title: this.props.title ? this.props.title : null,            // (defaults to og:title or twitter:title)
							//message: this.props.message ? this.props.message : null,     // (only for email sharing)
							//subject: this.props.subject ? this.props.subject : null  // (only for email sharing)
							////username: this.props.username ? this.props.username : null // (only for twitter sharing)
						  //}}
						///>					
//<br/><br/><FacebookShareButton className='btn btn-primary' quote={longTitle} url={shareLink}  ><Facebook size={26} />&nbsp;Facebook</FacebookShareButton>
                    
//<GooglePlusShareButton />
                    //<LinkedinShareButton/>
                    //<WhatsappShareButton/>
                    //<PinterestShareButton/>
                    //<RedditShareButton/>
                    //<TumblrShareButton/>
                      
 //<a  target='_new'  href={mailTo} className='btn btn-primary'  ><Email size={26}  />&nbsp;<span >&nbsp;Email</span></a>
                      //&nbsp;&nbsp;
                     
                     
                      //<a target="_new"  className="btn btn-primary twitter-share-button"
                      //href={twitterLink}
                      //data-size="large"><Twitter size={26}  />&nbsp;<span >&nbsp;Tweet</span></a>  
                      //&nbsp;&nbsp;
                     //<div  className="fb-share-button" 
                        //data-href={this.props.shareLink}
                        //data-size="large" data-mobile-iframe="true"
                        //data-layout="button_count" > </div>
                      //&nbsp;&nbsp;   
