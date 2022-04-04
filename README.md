# steam-deck-calculator

Site to estimate order availability for the steam deck.

Deployed at https://steam-deck-calculator.web.app/

It is designed to be extensible and if you are a developer, easy to add your own calculator to (submit PRs).

It is using pure JS, CSS, and HTML for simplicity. Typing would be nice, but not everyone has a typescript environment.


## Dockerfile
Simple nginx dockerfile can be run with:

`docker run <imageid> -p <random_port>:80`

TODO
 - add cool stats like distributions and charts
