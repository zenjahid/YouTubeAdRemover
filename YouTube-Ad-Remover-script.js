// ==UserScript==
// @name         YouTube Auto Replay and Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically skips to the end of a YouTube video and clicks replay for each new video loaded, and blocks YouTube ads and popup ads
// @author       Your Name
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/zenjahid/YouTubeAdRemover/raw/main/YouTube-Ad-Remover-script.js
// @downloadURL  https://github.com/zenjahid/YouTubeAdRemover/raw/main/YouTube-Ad-Remover-script.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let lastVideoId = null;

  // Function to block ads and popup ads
  function blockAds() {
    const adSelectors = [
      ".video-ads", // Desktop
      ".ytp-ad-module", // Desktop
      ".ytp-ad-player-overlay", // Desktop
      ".ytp-ad-overlay-container", // Desktop
      ".ytp-ad-overlay-slot", // Desktop
      'video[src*="googlevideo.com"]', // Mobile
      'video[src*="ads"]', // Mobile
      ".ad-interrupting", // Mobile
    ];

    adSelectors.forEach((selector) => {
      const ads = document.querySelectorAll(selector);
      ads.forEach((ad) => {
        ad.style.display = "none";
      });
    });

    const skipButton = document.querySelector(".ytp-ad-skip-button");
    if (skipButton) {
      skipButton.click();
    }

    // Block popup ads
    const popupAdSelectors = [
      ".ytp-ad-overlay-container", // Popup ads
      ".ytp-ad-overlay-slot", // Popup ads
    ];

    popupAdSelectors.forEach((selector) => {
      const popups = document.querySelectorAll(selector);
      popups.forEach((popup) => {
        popup.style.display = "none";
      });
    });
  }

  function skipToEndAndReplay() {
    const video = document.querySelector("video");

    if (video) {
      // Wait for the video's metadata to be loaded to get the exact duration
      video.addEventListener("loadedmetadata", () => {
        const videoDuration = video.duration;

        // Ensure it's the actual video and not an ad
        if (videoDuration > 0 && !video.classList.contains("ad-showing")) {
          // Skip to the end of the video
          video.currentTime = videoDuration - 0.5;

          // Wait for the video to end and click replay
          video.addEventListener("ended", () => {
            const replayButton = document.querySelector(".ytp-play-button");
            if (replayButton) {
              replayButton.click();
            }
          });
        }
      });
    }
  }

  function checkForNewVideo() {
    const url = new URL(window.location.href);
    const videoId = url.searchParams.get("v");

    if (videoId && videoId !== lastVideoId) {
      lastVideoId = videoId;
      waitForVideoAndExecute();
    }
  }

  function waitForVideoAndExecute() {
    const checkInterval = setInterval(() => {
      const video = document.querySelector("video");
      if (video) {
        clearInterval(checkInterval);
        skipToEndAndReplay();
      }
    }, 1000);
  }

  // Use MutationObserver to detect changes in the URL and DOM
  const observer = new MutationObserver(() => {
    blockAds();
    checkForNewVideo();
  });
  observer.observe(document, { childList: true, subtree: true });

  // Initial check for the first video
  blockAds();
  checkForNewVideo();
})();
