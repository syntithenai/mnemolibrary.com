## happy path
* greet
  - utter_greet
* mood_great
  - utter_happy

## sad path 1
* greet
  - utter_greet
* mood_unhappy
  - utter_cheer_up
  - utter_did_that_help
* affirm
  - utter_happy
  - action_stop_listening

## sad path 2
* greet
  - utter_greet
* mood_unhappy
  - utter_cheer_up
  - utter_did_that_help
* deny
  - utter_goodbye
  - action_stop_listening

## say goodbye
* goodbye
  - utter_goodbye
  - action_stop_listening
  
  

## bot challenge
* bot_challenge
  - utter_iamabot
  - action_stop_listening

## show me
* show_me{"pagetitle":"mnemo"}
  - action_show_me
  - action_stop_listening

## tell
* tell_me_about{"mnemotopic": "mnemo"}
    - action_tell_me_about
    - action_stop_listening

## greet then tell
* greet
    - utter_greet
* tell_me_about{"mnemotopic": "mnemo"}
    - action_tell_me_about
    - action_stop_listening

## review
* review
   - action_review

## discover
* discover
   - action_discover
