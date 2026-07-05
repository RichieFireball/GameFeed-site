(() => {
  const config = window.GAMEFEED_PADDLE_CONFIG;
  const status = document.querySelector("[data-checkout-status]");
  const params = new URLSearchParams(window.location.search);
  const hasTransactionLink = params.has("_ptxn");
  const requestedPlan = params.get("plan");

  const setStatus = (message, state = "info") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  if (!config || !window.Paddle) {
    setStatus("Secure checkout could not load. Please refresh or contact support.", "error");
    return;
  }

  try {
    window.Paddle.Initialize({
      token: config.clientToken,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
          variant: "one-page",
        },
      },
      eventCallback(event) {
        if (event?.name === "checkout.loaded") {
          setStatus("Secure Paddle Checkout is open.", "success");
        } else if (event?.name === "checkout.completed") {
          setStatus("Payment completed. Your receipt and subscription details are being prepared.", "success");
        } else if (event?.name === "checkout.error") {
          setStatus("Paddle could not open checkout. Please try again or contact support.", "error");
        }
      },
    });

    if (hasTransactionLink) {
      // Paddle.js automatically opens the transaction identified by _ptxn.
      setStatus("Opening your secure Paddle transaction…");
      return;
    }

    if (requestedPlan === "premium" && config.purchasesEnabled) {
      setStatus("Opening GameFeed Premium checkout…");
      window.Paddle.Checkout.open({
        items: [{ priceId: config.premiumPriceId, quantity: 1 }],
      });
      return;
    }

    setStatus(
      "Secure checkout is configured. New Premium purchases will open here after subscription verification is connected to the desktop app.",
    );
  } catch (_) {
    setStatus("Secure checkout could not initialize. Please try again later.", "error");
  }
})();
