export const loadStripeScript = () => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);

        const existingScript = document.querySelector("#stripe-js");
        if (existingScript) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.id = "stripe-js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};