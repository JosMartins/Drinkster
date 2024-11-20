![Drinkster](preview.png)

# Drinkster

Drinkster is a drinking game application that provides fun and engaging challenges for users to enjoy with friends.
Be it a party, a night out, or a casual gathering, Drinkster is the perfect companion to spice up the night. [^1]


## Features

- 🎲 Randomized drinking challenges to keep the fun unpredictable.
- ⚙️ Customizable game settings for tailored experiences.
- 📝 User-submitted challenges (hidden) for personalized twists.
- 🐳 Easy deployment with a single Docker Compose setup.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/josemartins/Drinkster.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Drinkster
    ```
3. Build and deploy:
    ```bash
    docker compose build
    ```

## Usage



1. Navigate to the project directory:
    ```bash
    cd Drinkster
    ```

2. Start the development server:
    ```bash
    docker compose up 
    ```
    or (to run in the background)
    ```bash
    docker compose up -d
    ```

3. Open your browser and navigate to `http://localhost:25569`

### Customization
 * Change Port
    - To change the port, edit the `docker-compose.yml` file and change the `ports` configuration for the `web` service.
    - For example, to change the port to `8080`, change the configuration to `8080:443`.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


[^1]: **Disclaimer**: Drinkster is intended for users of legal drinking age. Please drink responsibly.
