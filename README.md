# Buyzero Tracker

![](https://avatars.githubusercontent.com/u/64960609?s=180&v=4)

---

![](https://img.shields.io/docker/v/tmnn/buyzero?style=flat-square) ![](https://img.shields.io/docker/image-size/tmnn/buyzero?style=flat-square) ![](https://img.shields.io/docker/pulls/tmnn/buyzero?style=flat-square)

---

[TOCM]

[TOC]

## Features

- track availability of Products on https://buyzero.de/
- [Docker Hub Link](https://hub.docker.com/r/tmnn/buyzero 'Docker Hub Link')

## Usage

### Environment variables

`TOKEN` get a Token at : <https://notify.events/en/source/nodejs>
`URL` use a product url from buyzero.de (<https://buyzero.de/products/raspberry-pi-4-model-b-8gb>)
`DELAY_IN_SECONDS` set a delay in seconds between requests

---

###run using docker

    docker run -d -e URL="https://buyzero.de/products/raspberry-pi-4-model-b-8gb" -e TOKEN=<your_token_here> -e DELAY_IN_SECONDS=300 --name pi4-8gb tmnn/buyzero:alpha

###run local

    git clone https://github.com/tiimonn/buyzero.git
