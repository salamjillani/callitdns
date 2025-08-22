import { functions, auth } from "../firebase";
import { httpsCallable } from "firebase/functions";

const ensureAuthenticated = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Getting fresh token for Stripe operation...");

    // Reload user to ensure fresh auth state
    await currentUser.reload();

    const token = await currentUser.getIdToken(true);
    console.log("Fresh token obtained for Stripe:", {
      length: token?.length,
      uid: currentUser.uid,
    });

    // Validate token
    if (!token || token.length < 500) {
      throw new Error("Invalid token received");
    }

    // Wait for token propagation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return currentUser;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error("Authentication token error");
  }
};

const callFunctionWithRetry = async (functionName, data = {}) => {
  await ensureAuthenticated();

  const callable = httpsCallable(functions, functionName);

  try {
    const result = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`${functionName} error:`, error);

    if (
      error.code === "functions/unauthenticated" ||
      error.message?.includes("unauthenticated")
    ) {
      console.log(`Auth error for ${functionName}, trying complete refresh...`);

      try {
        // Complete user refresh
        const user = auth.currentUser;
        if (user) {
          await user.reload();
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const retryCallable = httpsCallable(functions, functionName);
          const retryResult = await retryCallable(data);
          return retryResult.data;
        }
      } catch (retryError) {
        console.error(`${functionName} retry failed:`, retryError);
        throw new Error(
          "Authentication failed. Please sign out and sign in again."
        );
      }
    }

    throw error;
  }
};

export const createCheckoutSession = async (priceId, successUrl, cancelUrl) => {
  return await callFunctionWithRetry("createCheckoutSession", {
    priceId,
    successUrl,
    cancelUrl,
  });
};

export const createPortalSession = async (returnUrl) => {
  return await callFunctionWithRetry("createPortalSession", {
    returnUrl,
  });
};

export const getUserSubscription = async () => {
  try {
    return await callFunctionWithRetry("getUserSubscription");
  } catch (error) {
    console.error("Get subscription error:", error);

    // Return free plan as fallback for any subscription errors
    return {
      plan: "free",
      features: { domains: 1, scansPerMonth: 10, dottyCommands: 5 },
    };
  }
};
