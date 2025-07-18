package com.drinkster.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
public class AiRequestService {
    private static final String SFW_FILE = "prompts/sfw_prompts.txt";
    private static final String NSFW_FILE = "prompts/nsfw_prompts.txt";

    private static final String SFW_URL = "https://api.openai.com/v1/chat/completions";
    private static final String NSFW_URL = "https://openrouter.ai/api/v1/chat/completions";

    private static final Logger logger = LoggerFactory.getLogger(AiRequestService.class);



    /**
     * Retrieves a prompt based on the difficulty and whether it is NSFW or SFW.
     *
     * @param difficulty the difficulty level of the prompt
     * @param nsfw       true if the prompt is NSFW, false if it is SFW
     * @return a formatted prompt string
     */
    public String getPrompt(String difficulty, boolean nsfw) {
        String promptFile =  nsfw ? NSFW_FILE : SFW_FILE;
        ClassPathResource resource = new ClassPathResource(promptFile);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String template = reader.lines().collect(Collectors.joining("\n"));
            return template.replace("{{difficulty}}", difficulty.toLowerCase());
        } catch (IOException e) {
            logger.error("Error reading prompt file: {}", promptFile, e);
            return "";
        }
    }

    public String getSfwChallenge(String difficulty) {
        String apiKey = System.getenv("OPENAI_API_KEY");
        String prompt = getPrompt(difficulty, false);

        String requestBody = """
            {
              "model": "gpt-3.5-turbo",
              "messages": [
                {
                  "role": "user",
                  "content": "%s"
                }
              ],
              "temperature": 0.8
            }
        """.formatted(prompt);

        return sendPostRequest(SFW_URL, apiKey, requestBody);
    }

    public String getNsfwChallenge(String difficulty) {
        String apiKey = System.getenv("OPENROUTER_API_KEY");
        String prompt = getPrompt(difficulty, true);

        String requestBody = """
            {
              "model": "gryphe/mythomax-l2-13b",
              "messages": [
                {
                  "role": "user",
                  "content": "%s"
                }
              ],
              "temperature": 0.8
            }
        """.formatted(prompt);

        return sendPostRequest(NSFW_URL, apiKey, requestBody);
    }

    private String sendPostRequest(String url, String apiKey, String body) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();
        } catch (IOException | InterruptedException e) {
            logger.error("Error making request to {}", url, e);
            return "";
        }
    }

}

