/* eslint-disable */ 

/**
 * This file implements a search component for the Music Brainz api.
 * 
The main search component provides a search and list user interface.
The search includes
- autoselect for artist
- search by pressing enter
- autoload on scroll in sets of 5

Each entry in the list can be expanded. When the item is expanded,
- an additional lookup is made to wikipedia/....  to find and show extra information
- the image is shown unrestricted in size

* 
* https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=15953433&apikey=3a63878798887988832588d75c974ce2e32c038933425f162219
 * 
 * Copyright: Steve Ryan <stever@syntithenai.com>  MIT Licence
 */
import React, { Component } from 'react';
import HelpNavigation from './HelpNavigation';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import scrollToComponent from 'react-scroll-to-component';
import Autocomplete from 'react-autocomplete'
import InfiniteScroll from 'react-infinite-scroller';
import MashupSearch from './MashupSearch';
//import countryCodes from './countryCodes';

export default class WikipediaSearch extends MashupSearch {   
	constructor(props) {
		super(props);
		this.expandItem = this.expandItem.bind(this)
		this.contractItem = this.contractItem.bind(this)
		this.clearSearch = this.clearSearch.bind(this)
		this.renderResult = this.renderResult.bind(this)
		this.showMessage = this.showMessage.bind(this)
		this.hideMessage = this.hideMessage.bind(this)
		
		this.expandData = this.expandData.bind(this)
		this.apiSearch = this.apiSearch.bind(this)
		this.getSearchMode = this.getSearchMode.bind(this)
		this.getSearchFor = this.getSearchFor.bind(this)
		this.getLink = this.getLink.bind(this)
		this.getBase64Image = this.getBase64Image.bind(this)
		this.setSearchUrl = this.setSearchUrl.bind(this)
		this.loadMore = this.loadMore.bind(this)
		this.firstSearch = this.firstSearch.bind(this)
		this.loadSuggestions = this.loadSuggestions.bind(this)
		this.submitForm = this.submitForm.bind(this)
		this.getSendButton = this.getSendButton.bind(this)
		this.searchModes = {
			//'All':{subtitle:'',searchLabel:"Search All",filter:[]},
			//'Fungi':{subtitle:'',searchLabel:"Search Australian Fungi",filter:["rk_kingdom:Fungi"],suggestFilter:["kingdom:Fungi"]},
		}
		this.discographyRef = null;
		
	}
	
	findCountryByCode(findCode) {
		let ret = ''
		if (countryCodes) {
			
			countryCodes.map(function(code) {
				if (code.code === findCode) {
					ret = code.name;
				}
			})
		}
		return ret;
	}
	
	
	/**
	 * Extract the common name from the result or fallback to name
	 */
	getName(result) {
		return result.disambiguation ? result.disambiguation  :''
	}
	
	/**
	 * Extract the scientific name from the result or fallback to concept name
	 */
	getCanonicalName(result) {
		return result.name;
		//let disambiguation = result.disambiguation ? ' '+result.disambiguation : ''; 
		//return result.composer ? result.name+' ' +result.composer + disambiguation  :result.name
	}
	
	getMBID(result) {
		return result.id;
	}
	
	
	/**
	 * Generate a link to ALA or wikipedia based on available information.
	 */
	getLink(result) {
		return result.link;
		//if (result.wikipediaPageId) {
			//return 'http://en.wikipedia.org/?curid='+result.wikipediaPageId;
		//}
	}
	
	getSecondaryLink(result) {
		if (result && result.wikipediaPageId && result.wikipediaPageId > 0) {
			let link = result && result.wikipediaPageId ? 'http://en.wikipedia.org/?curid='+result.wikipediaPageId : null;
			return <a target="_blank" href={link} className='btn btn-info' >Wikipedia</a>
		}
	}
	
	getSendButton(result,resultKey,user) {
		let that = this;
		 if (that.sendResult) {
			  return <button className='btn btn-success' onClick={(e) => that.sendResult(result,resultKey,user._id)} >Add To My Review List</button>
		} 
		return null;
	}
	
	// after header
	renderFacts(result,resultKey,user) {
	
	//return null;
		//return <div>.
					//<div>{result.canonicalNameAuthorship && <i>by {result.canonicalNameAuthorship}</i>}</div>
					//<div style={{width:'100%', clear:'both'}}>
						//{result.kingdom && <div><b>Kingdom:</b> {result.kingdom}</div>}
						//{result.phylum && <div><b>Phylum:</b> {result.phylum}</div>}
						//{result.class && <div><b>Class:</b> {result.class}</div>}
						//{result.order && <div><b>Order:</b> {result.order}</div>}
						//{result.family && <div><b>Family:</b> {result.family}</div>}
						//{result.genus && <div><b>Genus:</b> {result.genus}</div>}
			//<div><h3>Distribution Map</h3>
			////<AlaDistributionMap species={canonicalName} setMapRef={this.setMapRef} />
		////		</div>
					//<div style={{marginTop:'1em' ,marginBottom:'1em' ,width:'97%'}}>{result.description}</div>
				//</div>
			
	} 
	
	renderButtons(result,resultKey,user) {
			let that = this;
			let link = 'https://www.youtube.com/results?search_query='+that.getCanonicalName(result);
			return <a className='btn btn-info' href={link} target='_blank'  >Youtube</a>
	}
	
	// at end
	renderExtras(result,resultKey,user) {
			let that = this;
			let headlineFacts = result.headlineFacts && Object.keys(result.headlineFacts).length > 0 ?  Object.keys(result.headlineFacts).map(function(factKey,i) {
				let fact = result.headlineFacts[factKey];
				return <div key={i} className='fact '><b>{factKey}</b> <i>{fact}</i></div>
			}) : null;

		return <div>
				{headlineFacts ? <div style={{marginBottom:'1em', border: '1px solid black',paddingLeft:'0.7em', marginRight:'1em'}} >{headlineFacts}</div> : null}
				{result.description && <div>{result.description}</div>}
				

				<div ref={el => this.discographyRef = el} ><div>{result && result.albums && result.albums.length > 0 && <h3 style={{marginTop:'0.8em'}} >Discography</h3>}{result && result.albums ? result.albums.map(function(album,albumKey) {
				
					let link = 'https://www.youtube.com/results?search_query='+that.getCanonicalName(result)+'+'+album.title;
				
					return <div key={albumKey}  style={{minHeight: '300px'}}>
						<hr/>
						{album.image && <img style={{maxHeight:'300px', float:'right'}} src={album.image} />}
						<a style={{fontSize:'1.2em', fontWeight:'bold'}}  href={link} target='_blank' >{album.title}</a>
						<span> <b> Released</b> {album.date}</span>
						{JSON.stringify(album.works)}
							
						{album.tracks ?  album.tracks.map(function(work,workKey) {
							let wlink = 'https://www.youtube.com/results?search_query='+that.getCanonicalName(result)+'+'+work.title;
				
							return <div key={workKey} ><a href={wlink} target='_blank'  >{work.title}</a></div>
						}) : null}
					
					</div>
				}) : null}</div>
				
				</div>
			</div>

				//<div>{result && result.works && result.works.length > 0 && <h3>Works</h3>}{result && result.works ? result.works.map(function(work,workKey) {
				
					//let link = 'https://www.youtube.com/results?search_query='+that.getCanonicalName(result)+'+'+work.title;
				
					//return <div key={workKey} ><a href={link} target='_blank' >{work.title}</a></div>
				//}) : null}</div>
			
			//return <div>{JSON.stringify(result)}</div>
		//return null
		//<div><h3>Distribution Map</h3>
			//<AlaDistributionMap species={canonicalName} setMapRef={this.setMapRef} />
		//</div>
	}
	
    
    apiFetch(searchFor,searchForValue,searchMode,limit,skip) {
		let that = this;
		return new Promise(function(resolve,reject) {
			let extra = ''
			if (searchForValue && searchForValue.length > 0) {
				extra = ' AND artist:'+searchForValue
			}
		 
			let start = skip > 0 ? (skip * limit) : 0;
			let url = 'https://musicbrainz.org/ws/2/artist?query="'+searchFor+extra+'"&limit='+limit+'&offset='+start+'&fmt=json'
			fetch(url)
			.then(function(response) {
				return response.json()
			}).then(function(json) {
				// find the list results array
				let final = []
				if (json && json.artists) {
						final = Object.values(json.artists);
				}
				
				//if (json && json.works) {
				    //json.works.map(function (work,workKey) {
						//let composer = null;
						//let artist = null;
						//let disambiguation = null
						//console.log(work)
						//if (work.relations) {
							//work.relations.map(function(relation) {
								//// first match
								//console.log(['RELATION',relation])
								//if (!composer && (relation.type === 'writer' || relation.type === 'lyricist') && relation.artist && relation.artist.name) {
									//console.log('YES composer')
									//composer = relation.artist.name;
									//if (relation.artist.disambiguation) disambiguation= '('+ relation.artist.disambiguation+')'
								//} else if (!composer && relation.type === 'composer' && relation.artist && relation.artist.name) {
									//console.log('YES artist')
									//composer = relation.artist.name;
									//if (relation.artist.disambiguation) disambiguation= '('+ relation.artist.disambiguation+')'
								//} 
							//})
							
						//}
						//let finalArtist = composer? composer : (artist? artist : null);
						//if (finalArtist) final.push({mbId: work.id, composer:finalArtist, name:work.title, disambiguation: disambiguation,score:work.score} );
					//}) 
				//}
				//let final = json;
				resolve(final);
			})
		}) 
	}
    	
	/**
	 * Capture this result and save it as a question, then add it to the review feed (create a seen record)
	 */
	sendResult(result,resultKey,user) {
		let that = this;
		// defaults
//		console.log(this.discographyRef,this.discographyRef.innerHTML)
		result.answerDetails = this.discographyRef.innerHTML;
		
		that.props.fetch('/api/importquestion', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(Object.assign(result,{user:user,access:'public',interrogative:'Who is the musical artist ',question:that.getCanonicalName(result),difficulty:2,autoshow_image:"YES",answer:result.description,tags:result.extendedTags}))
			}).then(function() {
				that.showMessage('Saved for review')
			});
			//})
		//}
		
	}
	
	
	/**
	 * Lookup additional information about this entity 
	 */
	expandData(questionKey) {
		let that=this;
		// disable
		//let expanded = {};
		//expanded[questionKey] = true;
		//that.setState({expanded:expanded});
		//return
		that.startLoading()
		
		let question = this.state.results[questionKey];
		
		if (question && this.getMBID(question).length > 0) {
            // https://en.wikipedia.org/w/api.php?format=json&redirects=true&action=query&origin=*&prop=extracts&exintro=&explaintext=&titles="+this.getCanonicalName(question)
            let url = 'https:en.wikipedia.org/w/api.php?format=json&redirects=true&action=query&origin=*&prop=extracts&exintro=&explaintext=&titles='+this.getCanonicalName(question)
			//console.log(['LOAD  wikipedia desc',url])
				
			fetch(url)
			.then(function(response) {
				return response.json()
			}).then(function(wikijson) {
					
				fetch('https://musicbrainz.org/ws/2/release/?artist='+that.getMBID(question)+'&inc=recordings&limit=300&fmt=json')
				//https://musicbrainz.org/ws/2/release-group?artist='+that.getMBID(question)+'&limit=300&fmt=json')
				.then(function(response) {
					return response.json()
				}).then(function(releasejson) {
					// 
					fetch('https:en.wikipedia.org//w/api.php?origin=*&redirects=true&action=query&prop=pageimages&format=json&piprop=original&titles='+that.getCanonicalName(question))
					.then(function(response) {
						return response.json()
					}).then(function(imagejson) {
						
						// let iurl = 
							
						//fetch('https://musicbrainz.org/ws/2/release?artist='+that.getMBID(question)+'&inc=release-groups&limit=1000&fmt=json')
						//.then(function(response) {
							//return response.json()
						//}).then(function(worksjson) {	
						
							fetch('https://musicbrainz.org/ws/2/work?artist='+that.getMBID(question)+'&limit=300&fmt=json')
							.then(function(response) {
								return response.json()
							}).then(function(realworksjson) {	
							
						
								//console.log(['SONGS /albs LOADed ',worksjson])
								// find the list results array
								let final = []
								let questions = that.state.results;
										
								// description and link
								let wikidata = wikijson && wikijson.query && wikijson.query.pages && Object.values(wikijson.query.pages).length > 0 ? Object.values(wikijson.query.pages)[0] : null;
								
								if (wikidata && wikidata.extract) questions[questionKey].description = wikidata.extract;
								if (wikidata && wikidata.pageid) {
									questions[questionKey].wikipediaPageId = wikidata.pageid;
									questions[questionKey].link = 'http://en.wikipedia.org/?curid='+wikidata.pageid;
								}
								// image
								let wikiimagedata = imagejson && imagejson.query && imagejson.query.pages && Object.values(imagejson.query.pages).length > 0 ? Object.values(imagejson.query.pages)[0] : null;
								if (wikiimagedata && wikiimagedata.original && wikiimagedata.original.source) questions[questionKey].image = wikiimagedata.original.source;
								
								//console.log(['RELEASE DATA',releasejson])
								//let releasedata = releasejson && releasejson.query && releasejson.query.pages && Object.values(releasejson.query.pages).length > 0 ? Object.values(releasejson.query.pages)[0] : null;
								
								// filter albums and collate works
								let finalRelease = [];
								let albumIndex = {}
								let titles = {}
								//console.log(['RELEASE DATA grp',releasejson])
									
								if (releasejson && releasejson['releases']) {
									// first filter and flatten releases(albums) by title
									releasejson['releases'].map(function(release) {
										//if (!release['secondary-types'] || release['secondary-types'].length == 0) { 
											//if (!albumIndex.hasOwnProperty(release.title)) {
												console.log('rel',release['cover-art-archive'])
												let image = '';
												if (release['cover-art-archive'] && release['cover-art-archive'].artwork) {
													image = 'https://coverartarchive.org/release/'+release.id+'/front'
												} 
												
												let tracks = release.media && release.media.length > 0 && release.media[0].tracks ? release.media[0].tracks.map(function(track) {
													//console.log('tr',track)
													return {sort:track.position, title:track.title}
												}): []
												tracks.sort(function(a,b) {
													if (a.sort < b.sort) return -1 
													else return 1
												})
												albumIndex[release.title] = {
													id:release.id,
													image:image,
													date:release['date'],
													title:release['title'],
													tracks:tracks
												};
												titles[release.title] = true;
											//} 
											//else {
												//albumIndex[release.title].tracks = tracks;
											//}
										//}
									})
									//console.log(['RELEASE DATA',titles,albumIndex])
									
									// now index works so they can be crossed off and uncategorised works listed at end
									//let worksIndex=[]
									//let otherWorks = []
									////console.log(['WWWWORRR',realworksjson])
											
									//if (realworksjson && realworksjson.works) {
										//realworksjson.works.map(function(work) {
										////	console.log(['wwwwwwrork',work])
											//worksIndex.push(work.title);
											////let id = release.hasOwnProperty('release-group') ?  release['release-group'].id : null;
										//})
									//}
									//console.log(['ME RELEASE works',albumIndex,releasejson,worksjson,worksjson.works,realworksjson])
									// now iterate works, assigning to release group
									//if (worksjson && worksjson.releases) {
										//worksjson.releases.map(function(release) {
											//let id = release.hasOwnProperty('release-group') ?  release['release-group'].id : null;
											//if (id) {
												//console.log(['REL',release])
												//// did we collate this album (no secondary types)
												//if (albumIndex.hasOwnProperty(id)) {
													//if (!albumIndex[id].works) albumIndex[id].works = [];
													//albumIndex[id].works.push({date:release.date,title:release.title}); 
												//} else {
													//otherWorks.push({date:release.date, title:release.title})
												//} 
												
											//} 
											////console.log(['work',release])
										//})
									//}
									//albumIndex['Other Works'] = {date:'',title:'Other Works',works:otherWorks};
									finalRelease = Object.values(albumIndex)
									finalRelease.sort(function(a,b) {
										if (a.date < b.date) return -1 
										else return 1
									})
									
									//finalRelease.sort(function(a,b) {
										//if (a.date < b.date) return -1
										//return 1;
									//})
									questions[questionKey].albums = finalRelease;
								}
								
								// headline facts
								questions[questionKey].headlineFacts={};
								//questions[questionKey].headlineFacts.Albums = Object.keys(titles).join(',');
								//if (questions[questionKey].works) questions[questionKey].headlineFacts["Total Works"] = questions[questionKey].works.length;
								let tags = []
								let extendedTags=['musician']
								if (question.tags) {
									question.tags.map(function(tag) {
										if (tag.name && tag.name.trim().length > 0) {
											tags.push(tag.name);
											extendedTags.push(tag.name);
										}
										
									})
									questions[questionKey].headlineFacts.Tags = tags.join(",");
								}
								question.extendedTags = extendedTags;
								
								if (question['life-span'] && question['life-span'].begin) {
									questions[questionKey].headlineFacts.Begin = question['life-span'].begin;
								}
								 //else {
									//questions[questionKey].headlineFacts.Begin = '';
								//}
								//
								
								if (question.country) {
									question.country = that.findCountryByCode(question.country);
									questions[questionKey].headlineFacts.Location = question.country;
									if (question['begin-area'] && question['begin-area'].name) questions[questionKey].headlineFacts.Location =  question['begin-area'].name +  ', ' + question.country;
								}
								// set quiz by decade or fallback to country (or finally just Musicians)
								if (question && question.country) {
									question.quiz = 'Musicians of '+question.country;
								} else {
									question.quiz = 'Musicians';
								}
								//let decade = 0;
								//if (question.headlineFacts.Begin.length > 0) {
									//question.quiz = 'Musicians of the '+((parseInt(question.headlineFacts.Begin,10)%100)*10)+"'s"
								//}  
								question.link2 = 'https://www.youtube.com/results?search_query='+that.getCanonicalName(question);
								question.link2Title = 'YouTube'
								
								that.stopLoading()
			
								that.setState({results:questions})
							})
						//})
					})
					
				 })
			})

             //var url="https://en.wikipedia.org/w/api.php?format=json&redirects=true&action=query&origin=*&prop=extracts&exintro=&explaintext=&titles="+this.getCanonicalName(question)
	 
			//console.log(['expand wiki data',url])
		
		     //fetch(url).then(function(response) {
                //return response.json();
            //}).then(function(json) {
				//let questions = that.state.results;
				
				//let pages = json.query && json.query.pages ? json.query.pages : null;
				//let questionsLoaded = pages && Object.values(pages).length > 0 ? Object.values(pages) : null;
				//console.log(['expand results',questionsLoaded,json])
				//if (questionsLoaded && questionsLoaded[0] && questionsLoaded[0].pageid > 0) {
					//let questionLoaded = questionsLoaded[0];
					//questions[questionKey].description = questionLoaded.extract;
					//questions[questionKey].wikipediaPageId = questionLoaded.pageid;
					//let expanded = {};
					//expanded[questionKey] = true;
					//that.setState({results:questions,expanded:expanded});
				//// try again with common name
				//} else if (that.getName(question).length > 0)  {
					//var url="https://en.wikipedia.org/w/api.php?format=json&redirects=true&action=query&origin=*&prop=extracts&exintro=&explaintext=&titles="+that.getName(question)
	 
					//console.log(['expand wikidata by common name',url])
		
		            //fetch(url).then(function(response) {
						//return response.json();
					//}).then(function(json) {
						//let questions = that.state.results;
						
						//let pages = json.query && json.query.pages ? json.query.pages : null;
						//let questionsLoaded = pages && Object.values(pages).length > 0 ? Object.values(pages)  : null;
						//console.log(['expand results',questionsLoaded,json])
						//if (questionsLoaded && questionsLoaded[0] && questionsLoaded[0].pageid > 0) {
							//let questionLoaded = questionsLoaded[0];
							//questions[questionKey].description = questionLoaded.extract;
							//questions[questionKey].wikipediaPageId = questionLoaded.pageid;
							//let expanded = {};
							//expanded[questionKey] = true;
							//that.setState({results:questions,expanded:expanded});
						//}
					//})
				//}
            //})
            //.catch(function(err) {
                //console.log(['ERR loading wiki results',err]);
            //});
        }
	}
	
	
	/**
	 * Load autocomplete suggestions
	 */
	loadSuggestions(searchFor) {
		let that = this;
		this.setState({single:null})
		//let searchMode = this.getSearchMode()
		let p = new Promise(function(resolve,reject) {
			let extra='';
			let url = 'https://musicbrainz.org/ws/2/artist?query="'+searchFor+'"&limit=50&fmt=json'
			
			//console.log(['SEARCH with ',url])
			fetch(url)
			  .then(function(response) {
				return response.json()
			  }).then(function(json) {
			//	console.log(['GOT', json])
				
				let final = json && json.artists ? json.artists : [];
				that.setState({suggestions:final});
				that.loading = false;
				resolve(final)
			  }).catch(function(ex) {
				console.log(['error loading results', ex])
				reject()
			})			
			
		})
		return p
	}
	
	
    
    renderSuggestItem(item) {
		if (item) return <div><b>{item.commonName ? item.commonName.join(' ') : item.name}</b> <i>{item.name}</i></div>
	}
    
    getSuggestionCanonicalName(item) {
		return item && item.name
	}
    
   
	/**
	 * Render a single result
	 */
	//renderResult(result,resultKey,isRow) {
		//let that = this;
		//if (result) {
			//let alaLink=result.link; //"https://bie.ala.org.au/species/"+result.guid;
			////let alaGalleryLink = alaLink + "#gallery"
			////let wikipediaLink = 'http://en.wikipedia.org/?curid='+result.wikipediaPageId;
						
			//let expandedLink = that.getCanonicalName(result).length > 0 ? this.props.routerBaseUrl+"/"+encodeURIComponent(that.getCanonicalName(result))	: null;		
			//let isExpanded = that.state.expanded[resultKey] ? true : false;
			//let commonName = that.getName(result).length > 0 ? that.getName(result) : <br/>;
			//let canonicalName = that.getCanonicalName(result)			
			//// strip common name if it is just the canonical name
			//if (canonicalName.indexOf(commonName) !== -1) {
				//commonName=null
			//}
			//if (!canonicalName) return null; 
			//let rowClass='';
			//let rowStyle = {}
			//if (isRow) {
				//rowClass='col-12 col-lg-6'
			//} else {
				//rowStyle={width:'100%'}
			//}
			//return <div  key={resultKey} style={rowStyle} className={rowClass}  >
				//<div style={{width:'100%', clear:'both'}} >
					//{this.state.results.length > 1 && <div style={{float:'left', marginRight:'1em'}} >
						//{!isExpanded && expandedLink && <span ><div  onClick={(e) => that.expandItem(resultKey)} className='btn btn-info' >+</div></span>}
						//{isExpanded && expandedLink && <span ><div  onClick={(e) => that.contractItem(resultKey)} className='btn btn-info' >-</div></span>}
					//</div>}
					//{isExpanded && <div style={{float:'right'}}>
						//{alaLink && <span ><a target="_blank" href={alaLink} className='btn btn-info' >Link</a></span>}
						//{<span >{this.getSecondaryLink(result)}</span>
						//{this.props.user && this.sendResult && <span>{this.getSendButton(result,resultKey,this.props.user)}</span>}
					//</div>}
						//{commonName && <div style={{fontWeight:'bold'}} >{commonName}</div>}
						//<i>{canonicalName}</i>   
					
				//</div>

				
				//{ isExpanded && <div style={{width:'100%', clear:'both'}}>
					//{this.renderFacts(result,resultKey,this.props.user)}
				//}
				
				  //<div ref={(section) => { this.scrollTo.end = section; }} ></div>
               
				//{!isExpanded &&  result.imageUrl && <img crossOrigin="anonymous" ref={(section) => { this.images[resultKey] = section; }}  onClick={(e) => this.getBase64Image(resultKey)} style={{maxHeight:'300px' }}  src={result.smallImageUrl} />}   
				//{isExpanded &&  result.imageUrl && <img  crossOrigin="anonymous" ref={(section) => { this.images[resultKey] = section; }}    onClick={(e) => this.getBase64Image(resultKey)} src={result.smallImageUrl} />}   
			//<br/><br/>
				//{ isExpanded && this.renderExtras()}
				//<hr/>
			//</div>
		//} else {
			//return null;
		//}
	//}
	
	 /**
	 * Render component
	 */
	//render() {
		//if (this.props.analyticsEvent) this.props.analyticsEvent('ala search');
		//let that = this;
		//let expandedKeys = Object.keys(this.state.expanded);
		//let rendered = this.state.results && this.state.results.length > 0 ? this.state.results.map(function(result,resultKey) {
			//return that.renderResult(result,resultKey,true)
		//}) : null;
		//let selectedMode = that.searchModes.hasOwnProperty(this.getSearchMode()) ? this.getSearchMode() : 'All' 
		//let searchLabel = that.searchModes[selectedMode].searchLabel
		//let searchModes = Object.keys(that.searchModes).map(function(modeKey) {
			//let mode = that.searchModes[modeKey]
			//let modeLink = this.props.routerBaseUrl+'/mode/'+encodeURIComponent(modeKey)
			//let style={}
			//if (selectedMode === modeKey) {
				//style={fontWeight:'bold',border:'2px solid black'}
			//}
			//return <Link key={modeKey} style={style} to={modeLink} className='btn btn-info'>{modeKey}</Link>
		//})
		//let loader = this.state.hasMore ? <div className="loader" key={0}></div> : <div className="loader"></div>;
        //return  (
        //<div className="alasearch"  style={{marginLeft:'0.5em'}}>
			//<div  ref={(section) => { this.scrollTo.topofpage = section; }} ></div>
               
			//<h3>{searchLabel}</h3>
			//{this.state.message && <b style={{position:'fixed',top:'7em',left:'50%',backgroundColor:'pink',border:'1px solid black',color:'black',padding:'0.8em'}}>{this.state.message}</b>}

	  
			//<div style={{padding:'0.5em',backgroundColor:'grey',border:'1px solid black',marginBottom:'1em'}}>
			
			
			//<div style={{marginTop:'0.5em',marginBottom:'0.5em'}}>
			//{searchModes}
			//</div>
			
			//<div style={{float:'right'}}>
			//<Link to={that.props.routerBaseUrl} className="btn btn-danger">Reset</Link>
			//</div>
			
			//<form onSubmit={(e) => this.submitForm(e)}>
			  //<Autocomplete
			//getItemValue={(item) => that.getSuggestionCanonicalName(item)   }
			//items={that.state.suggestions}
			//renderItem={(item, isHighlighted) => {
				//return <div style={{ borderBottom: '1px solid grey',borderTop: '1px solid grey',width: '100%' ,background: isHighlighted ? 'lightgray' : 'white' }}>
				  //{this.renderSuggestItem(item)}
				//</div>
			//}}
			//value={that.state.searchForValue}
			
			//onSelect={(value, item) => {
				//console.log(['SELECT',value,item])
				//that.setState({ searchFor:that.getSuggestionCanonicalName(item), suggestions: []})
				//that.submitFormOnSelect();
			//}}
			//onChange={(event, value) => {
				//that.setState({ searchForValue:value})
				
				//if (that.suggestTimeout) clearTimeout(that.suggestTimeout)
				//that.suggestTimeout = setTimeout(function() {that.loadSuggestions(value)},500)
			//}}
			
          //renderMenu={children => (
            //<div className="menu" style={{ width:'100%'}}>
              //{children}
            //</div>
          //)}
        ///>
			
			//</form>
			//<b>{that.state.searchFor}</b>
			//</div>
			
			//<InfiniteScroll
				//pageStart={0}
				//loadMore={this.loadMore}
				//hasMore={!!this.state.hasMore}
				//loader={loader}
			//>
			//<div className='row'>
			//{rendered}
			//</div>

			//</InfiniteScroll>
			
			
         //</div>
        //)
    //}
}
