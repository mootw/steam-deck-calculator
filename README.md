[![Container Build](https://github.com/MooNag/steam-deck-calculator/actions/workflows/build.yml/badge.svg)](https://github.com/MooNag/steam-deck-calculator/actions/workflows/build.yml)
[![HTML Validate](https://github.com/MooNag/steam-deck-calculator/actions/workflows/validate.yml/badge.svg)](https://github.com/MooNag/steam-deck-calculator/actions/workflows/validate.yml)

# steam-deck-calculator

Site to estimate order availability for the steam deck.

Deployed at https://steam-deck-calculator.web.app/

It is designed to be extensible and if you are a developer, easy to add your own calculator to (submit PRs).

It is using pure JS, CSS, and HTML for simplicity. Typing would be nice, but not everyone has a typescript environment.


## Dockerfile
Simple nginx dockerfile can be run with:

`docker run <imageid> -p <random_port>:80`

TODO
 - Add cool stats like distributions and charts
 - Migrate CSV to database
 - Automatically take user input and add to database 
 - Container configuration for SSL Certs
