import {
    BedrockAgentRuntimeClient,
    InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";


/**
 * @typedef {Object} ResponseBody
 * @property {string} completion
 */

/**
 * Invokes a Bedrock agent to run an inference using the input
 * provided in the request body.
 *
 * @param {string} prompt - The prompt that you want the Agent to complete.
 * @param {string} sessionId - An arbitrary identifier for the session.
 */
export const invokeBedrockAgent = async (prompt, sessionId) => {
    // const client = new BedrockAgentRuntimeClient({ region: "us-west-2" });
    const client = new BedrockAgentRuntimeClient({
      region: "us-west-2",
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY, // permission to invoke agent
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
      },
    });

    const agentId = "ZZ88CT3BIC";
    const agentAliasId = "TSTALIASID";
    // ONVFAHX9UM <- static version
    // TSTALIASID <- test alias id

    const command = new InvokeAgentCommand({
        agentId,
        agentAliasId,
        sessionId,
        inputText: prompt,
    });

    try {
        let completion = "";
        const response = await client.send(command);

        if (response.completion === undefined) {
            throw new Error("Completion is undefined");
        }

        for await (let chunkEvent of response.completion) {
            const chunk = chunkEvent.chunk;
            console.log(chunk);
            const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
            completion += decodedResponse;
        }

        return { sessionId: sessionId, completion };
    } catch (err) {
        console.error(err);
    }
};

// Call function if run directly
// // import { fileURLToPath } from "url";
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//     const result = await invokeBedrockAgent("I need help.", "123");
//     console.log(result);
// }

