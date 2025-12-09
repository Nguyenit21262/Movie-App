import marvelLogo from './marvelLogo.svg'
import googlePlay from './googlePlay.svg'
import appStore from './appStore.svg'
import screenImage from './screenImage.svg'
import profile from './profile.png'
import logo from './logo.png'

export const assets = {
    logo,
    marvelLogo,
    googlePlay,
    appStore,
    screenImage,
    profile
}


export const dummyTrailers = [
    {
        image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/WpW36ldAqnM"
    },
    {
        image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/-sAOWhvheK8"
    },
    {
        image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/1pHDWnXmK7Y"
    },
    {
        image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/umiKiW4En9g"
    }
];


const dummyCastsData = [
    { "name": "Milla Jovovich", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg", },
    { "name": "Dave Bautista", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg", },
    { "name": "Arly Jover", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg", },
    { "name": "Amara Okereke", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg", },
    { "name": "Fraser James", "profile_path": "https://image.tmdb.org/t/p/original/mGAPQG2OKTgdKFkp9YpvCSqcbgY.jpg", },
    { "name": "Deirdre Mullins", "profile_path": "https://image.tmdb.org/t/p/original/lJm89neuiVlYISEqNpGZA5kTAnP.jpg", },
    { "name": "Sebastian Stankiewicz", "profile_path": "https://image.tmdb.org/t/p/original/hLN0Ca09KwQOFLZLPIEzgTIbqqg.jpg", },
    { "name": "Tue Lunding", "profile_path": "https://image.tmdb.org/t/p/original/qY4W0zfGBYzlCyCC0QDJS1Muoa0.jpg", },
    { "name": "Jacek Dzisiewicz", "profile_path": "https://image.tmdb.org/t/p/original/6Ksb8ANhhoWWGnlM6O1qrySd7e1.jpg", },
    { "name": "Ian Hanmore", "profile_path": "https://image.tmdb.org/t/p/original/yhI4MK5atavKBD9wiJtaO1say1p.jpg", },
    { "name": "Eveline Hall", "profile_path": "https://image.tmdb.org/t/p/original/uPq4xUPiJIMW5rXF9AT0GrRqgJY.jpg", },
    { "name": "Kamila Klamut", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg", },
    { "name": "Caoilinn Springall", "profile_path": "https://image.tmdb.org/t/p/original/uZNtbPHowlBYo74U1qlTaRlrdiY.jpg", },
    { "name": "Jan Kowalewski", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg", },
    { "name": "Pawel Wysocki", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg", },
    { "name": "Simon Lööf", "profile_path": "https://image.tmdb.org/t/p/original/cbZrB8crWlLEDjVUoak8Liak6s.jpg", },
    { "name": "Tomasz Cymerman", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg", }
]

export const dummyShowsData = [
    {
        "_id": "324544",
        "id": 324544,
        "title": "In the Lost Lands",
        "overview": "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
        "poster_path": "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 14, "name": "Fantasy" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-02-27",
        "original_language": "en",
        "tagline": "She seeks the power to free her people.",
        "vote_average": 6.4,
        "vote_count": 15000,
        "runtime": 102,
        "image": "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/WpW36ldAqnM"
        
        
    },
    {
        "_id": "1232546",
        "id": 1232546,
        "title": "Until Dawn",
        "overview": "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers. Exploring an abandoned visitor center, they find themselves stalked by a masked killer and horrifically murdered one by one...only to wake up and find themselves back at the beginning of the same evening.",
        "poster_path": "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-23",
        "original_language": "en",
        "tagline": "Every night a different nightmare.",
        "vote_average": 6.405,
        "vote_count": 18000,
        "runtime": 103,
        "image": "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/-sAOWhvheK8"
    },
    {
        "_id": "552524",
        "id": 552524,
        "title": "Lilo & Stitch",
        "overview": "The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.",
        "poster_path": "https://image.tmdb.org/t/p/original/mKKqV23MQ0uakJS8OCE2TfV5jNS.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Hold on to your coconuts.",
        "vote_average": 7.117,
        "vote_count": 27500,
        "runtime": 108,
        "image": "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/1pHDWnXmK7Y"
    },
    {
        "_id": "668489",
        "id": 668489,
        "title": "Havoc",
        "overview": "When a drug heist swerves lethally out of control, a jaded cop fights his way through a corrupt city's criminal underworld to save a politician's son.",
        "poster_path": "https://image.tmdb.org/t/p/original/ubP2OsF3GlfqYPvXyLw9d78djGX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/65MVgDa6YjSdqzh7YOA04mYkioo.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 80, "name": "Crime" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-25",
        "original_language": "en",
        "tagline": "No law. Only disorder.",
        "vote_average": 6.537,
        "vote_count": 35960,
        "runtime": 107,
        "image": "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/umiKiW4En9g"
    },
    {
        "_id": "950387",
        "id": 950387,
        "title": "A Minecraft Movie",
        "overview": "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld: a bizarre, cubic wonderland that thrives on imagination. To get back home, they'll have to master this world while embarking on a magical quest with an unexpected, expert crafter, Steve.",
        "poster_path": "https://image.tmdb.org/t/p/original/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 12, "name": "Adventure" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-03-31",
        "original_language": "en",
        "tagline": "Be there and be square.",
        "vote_average": 6.516,
        "vote_count": 15225,
        "runtime": 101,
    },
    {
        "_id": "575265",
        "id": 575265,
        "title": "Mission: Impossible - The Final Reckoning",
        "overview": "Ethan Hunt and team continue their search for the terrifying AI known as the Entity — which has infiltrated intelligence networks all over the globe — with the world's governments and a mysterious ghost from Hunt's past on their trail. Joined by new allies and armed with the means to shut the Entity down for good, Hunt is in a race against time to prevent the world as we know it from changing forever.",
        "poster_path": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/1p5aI299YBnqrEEvVGJERk2MXXb.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Our lives are the sum of our choices.",
        "vote_average": 7.042,
        "vote_count": 19885,
        "runtime": 170,
    },
    {
        "_id": "986056",
        "id": 986056,
        "title": "Thunderbolts*",
        "overview": "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission that will force them to confront the darkest corners of their pasts.",
        "poster_path": "https://image.tmdb.org/t/p/original/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-30",
        "original_language": "en",
        "tagline": "Everyone deserves a second shot.",
        "vote_average": 7.443,
        "vote_count": 23569,
        "runtime": 127,
    },
    // --- Bổ sung phim mới ---
    {
        "_id": "1400000",
        "id": 1400000,
        "title": "Starfall: The Last Fleet",
        "overview": "In a distant future, the last surviving human fleet battles a relentless alien empire for the fate of the galaxy. A small band of pilots must embark on a suicide mission to destroy the alien superweapon before Earth's defense lines collapse.",
        "poster_path": "https://image.tmdb.org/t/p/original/a0f1iS7jM3k4aZz3pQ1c9rV6wJk.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/b3c7tA8d9e2aW4d5f9iE3gH7lXy.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-01-15",
        "original_language": "en",
        "tagline": "The stars are falling. Humanity is fighting back.",
        "vote_average": 7.9,
        "vote_count": 45000,
        "runtime": 135,
        "image": "https://img.youtube.com/vi/IoXn_mw5gtM/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/IoXn_mw5gtM"
    },
    {
        "_id": "1400001",
        "id": 1400001,
        "title": "Aisle Say I Do",
        "overview": "Two wedding planners, who are sworn rivals, are forced to work together on the biggest society wedding of the year, only to discover their competitive spirit masks a growing attraction. Can they pull off the perfect wedding without killing each other... or falling in love?",
        "poster_path": "https://image.tmdb.org/t/p/original/c4d3tF2gP6rE8lQ9k3vD5bB2hGf.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/d8e1pG0hR2fV9tF4h0iN5cO1vUq.jpg",
        "genres": [
            { "id": 10749, "name": "Romance" },
            { "id": 35, "name": "Comedy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-02-14",
        "original_language": "en",
        "tagline": "They planned the wedding. They didn't plan on falling in love.",
        "vote_average": 6.8,
        "vote_count": 12500,
        "runtime": 98,
        "image": "https://img.youtube.com/vi/ZZHsDQt_XeA/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/ZZHsDQt_XeA"
    },

    {
        "_id": "1400002",
        "id": 1400002,
        "title": "Cyberpunk: Neon Dreams",
        "overview": "In a dystopian megacity, a rogue hacker uncovers a conspiracy that connects the city's corrupt corporate overlords to a series of mysterious disappearances. Teaming up with a former enforcer, they must dive deep into the digital underworld to expose the truth before they become the next targets.",
        "poster_path": "https://image.tmdb.org/t/p/original/7Qr6yZ6IyPRC0a5q6wzVk8hNzLp.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/8d3B7pXdkqRVvVvj8q4G7U4z6N9.jpg",
        "genres": [
            { "id": 878, "name": "Science Fiction" },
            { "id": 28, "name": "Action" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-03-08",
        "original_language": "en",
        "tagline": "In a world of wires, trust no one.",
        "vote_average": 8.1,
        "vote_count": 32500,
        "runtime": 128,
        "image": "https://img.youtube.com/vi/Cy6kKMAncX8/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/Cy6kKMAncX8"
    },
    {
        "_id": "1400003",
        "id": 1400003,
        "title": "Kingdom of the Midnight Sun",
        "overview": "An epic fantasy tale of a young prince who must reclaim his throne from a treacherous uncle with the help of mythical creatures and ancient magic. Journey through enchanted forests and frozen tundras in this tale of honor, betrayal, and destiny.",
        "poster_path": "https://image.tmdb.org/t/p/original/5kSJd8WvY9rL2pB7q3NtF6gH2Mv.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/9r4tG5wX7vN3d8Y2pF6hJ1kL0Qx.jpg",
        "genres": [
            { "id": 14, "name": "Fantasy" },
            { "id": 12, "name": "Adventure" },
            { "id": 10752, "name": "War" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-04-22",
        "original_language": "en",
        "tagline": "The crown is heavy, but destiny is heavier.",
        "vote_average": 7.6,
        "vote_count": 28750,
        "runtime": 156,
        "image": "https://img.youtube.com/vi/D9e6L5Kp7Vc/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/D9e6L5Kp7Vc"
    },
    {
        "_id": "1400004",
        "id": 1400004,
        "title": "Silent Whispers",
        "overview": "A psychological thriller about a deaf investigator who uses her unique perception to solve a series of murders in a small coastal town. As she gets closer to the truth, she realizes the killer might be someone she trusts, and the whispers of the past are louder than she imagined.",
        "poster_path": "https://image.tmdb.org/t/p/original/3vP8qW5fR2tG7hJ4kL9nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/6mN9tB5vK3jL8pQ2rF4gH7wV0Xy.jpg",
        "genres": [
            { "id": 53, "name": "Thriller" },
            { "id": 9648, "name": "Mystery" },
            { "id": 80, "name": "Crime" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-05-14",
        "original_language": "en",
        "tagline": "Some secrets are heard only in silence.",
        "vote_average": 7.9,
        "vote_count": 19500,
        "runtime": 118,
        "image": "https://img.youtube.com/vi/Fg8kqLmN2sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/Fg8kqLmN2sE"
    },
    {
        "_id": "1400005",
        "id": 1400005,
        "title": "Retrograde",
        "overview": "When a failed Mars colony mission leaves astronauts stranded, they must make an impossible choice: wait for a rescue that may never come or attempt a dangerous return journey with limited resources. Tensions rise as they struggle to survive in the harsh Martian environment.",
        "poster_path": "https://image.tmdb.org/t/p/original/4wX5yL7vN3bR6tG8hJ9kM1nL2Qx.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/7zP3qV8tG5hJ4kL9nM2bX1ZyWv.jpg",
        "genres": [
            { "id": 878, "name": "Science Fiction" },
            { "id": 18, "name": "Drama" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-06-30",
        "original_language": "en",
        "tagline": "400 million miles from home. No way back.",
        "vote_average": 8.3,
        "vote_count": 41200,
        "runtime": 142,
        "image": "https://img.youtube.com/vi/G9hLqM4n3sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/G9hLqM4n3sE"
    },
    {
        "_id": "1400006",
        "id": 1400006,
        "title": "The Last Laugh",
        "overview": "A stand-up comedian's life takes a dark turn when a joke from his past resurfaces and goes viral for all the wrong reasons. As his career crumbles and relationships fracture, he must confront his demons and decide what he's willing to sacrifice for one more shot at redemption.",
        "poster_path": "https://image.tmdb.org/t/p/original/5tG6hJ7vN3bR4kL9nM2bX1ZyQw.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/8vP3qW5fR2tG7hJ4kL9nM2bX1Zy.jpg",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-07-15",
        "original_language": "en",
        "tagline": "Sometimes the joke is on you.",
        "vote_average": 7.4,
        "vote_count": 16800,
        "runtime": 112,
        "image": "https://img.youtube.com/vi/H0iJkL8mN2sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/H0iJkL8mN2sE"
    },
    {
        "_id": "1400007",
        "id": 1400007,
        "title": "Shadow Protocol",
        "overview": "An elite special forces unit is sent on a covert mission to extract a high-value target from a hostile country. When the mission is compromised, they must navigate through enemy territory while being hunted by both foreign agents and their own government who want to bury the operation.",
        "poster_path": "https://image.tmdb.org/t/p/original/6vP3qW5fR2tG7hJ4kL9nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/9wX5yL7vN3bR6tG8hJ9kM1nL2Qx.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 53, "name": "Thriller" },
            { "id": 10752, "name": "War" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-08-12",
        "original_language": "en",
        "tagline": "Off the books. Out of time.",
        "vote_average": 7.8,
        "vote_count": 29500,
        "runtime": 134,
        "image": "https://img.youtube.com/vi/I1jKkL9mN2sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/I1jKkL9mN2sE"
    },
    {
        "_id": "1400008",
        "id": 1400008,
        "title": "Echoes of Yesterday",
        "overview": "A time-travel romance about a historian who discovers she can visit the past through artifacts. When she falls in love with a man from 1920s Paris, she must choose between her life in the present and a love that transcends time, risking the very fabric of reality.",
        "poster_path": "https://image.tmdb.org/t/p/original/7xP4qW6fR3tG8hJ5kL9nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/0wY5zL8vN4bR7tG9hJ1kM2nL3Qx.jpg",
        "genres": [
            { "id": 10749, "name": "Romance" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-09-05",
        "original_language": "en",
        "tagline": "Love knows no time, but time knows no mercy.",
        "vote_average": 8.0,
        "vote_count": 23800,
        "runtime": 126,
        "image": "https://img.youtube.com/vi/J2kLlM9mN3sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/J2kLlM9mN3sE"
    },
    {
        "_id": "1400009",
        "id": 1400009,
        "title": "Crimson Tides",
        "overview": "During the golden age of piracy, a disgraced naval captain forms an uneasy alliance with a notorious pirate queen to hunt down a legendary treasure ship. But as they sail through treacherous waters, they must contend with rival pirates, naval patrols, and their own conflicting loyalties.",
        "poster_path": "https://image.tmdb.org/t/p/original/8yP5qW7fR4tG9hJ6kL8nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/1xY6zL9vN5bR8tG0hJ2kM3nL4Qx.jpg",
        "genres": [
            { "id": 12, "name": "Adventure" },
            { "id": 28, "name": "Action" },
            { "id": 36, "name": "History" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-10-18",
        "original_language": "en",
        "tagline": "On these waters, trust is the deadliest currency.",
        "vote_average": 7.7,
        "vote_count": 26700,
        "runtime": 148,
        "image": "https://img.youtube.com/vi/K3lMmN9mN4sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/K3lMmN9mN4sE"
    },
    {
        "_id": "1400010",
        "id": 1400010,
        "title": "Frostbite",
        "overview": "A survival horror set in an isolated Arctic research station where scientists discover an ancient organism frozen in the ice. When the specimen thaws, it unleashes a predatory creature that hunts them through the snowstorm-ravaged facility, where escape is impossible and rescue is days away.",
        "poster_path": "https://image.tmdb.org/t/p/original/9zP6qW8fR5tG0hJ7kL9nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/2xY7zL0vN6bR9tG1hJ3kM4nL5Qx.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 53, "name": "Thriller" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-11-08",
        "original_language": "en",
        "tagline": "In the coldest place on Earth, something warm is waiting.",
        "vote_average": 7.5,
        "vote_count": 18900,
        "runtime": 116,
        "image": "https://img.youtube.com/vi/L4mNnO9mN5sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/L4mNnO9mN5sE"
    },
    {
        "_id": "1400011",
        "id": 1400011,
        "title": "The Grand Illusionist",
        "overview": "In 19th century London, a master illusionist is recruited by Scotland Yard to help solve a series of impossible crimes that seem to defy the laws of nature. As he gets closer to the truth, he realizes the crimes are connected to a secret society of magicians with a dangerous agenda.",
        "poster_path": "https://image.tmdb.org/t/p/original/0aP7qW9fR6tG1hJ8kL0nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/3xY8zL1vN7bR0tG2hJ4kM5nL6Qx.jpg",
        "genres": [
            { "id": 9648, "name": "Mystery" },
            { "id": 80, "name": "Crime" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-12-20",
        "original_language": "en",
        "tagline": "The greatest trick is staying alive.",
        "vote_average": 8.2,
        "vote_count": 31200,
        "runtime": 138,
        "image": "https://img.youtube.com/vi/M5nOoP9mN6sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/M5nOoP9mN6sE"
    },
    {
        "_id": "1400012",
        "id": 1400012,
        "title": "Velocity",
        "overview": "A former racing champion is forced out of retirement for one last race when his daughter is kidnapped by a crime syndicate. With his family's life on the line, he must compete in a deadly underground race across Europe while evading law enforcement and rival drivers.",
        "poster_path": "https://image.tmdb.org/t/p/original/1bP8qW0fR7tG2hJ9kL1nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/4xY9zL2vN8bR1tG3hJ5kM6nL7Qx.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 53, "name": "Thriller" },
            { "id": 80, "name": "Crime" }
        ],
        "casts": dummyCastsData,
        "release_date": "2027-01-14",
        "original_language": "en",
        "tagline": "One race. No rules. Everything to lose.",
        "vote_average": 7.3,
        "vote_count": 24500,
        "runtime": 122,
        "image": "https://img.youtube.com/vi/N6oPpQ9mN7sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/N6oPpQ9mN7sE"
    },
    {
        "_id": "1400013",
        "id": 1400013,
        "title": "The Last Symphony",
        "overview": "A reclusive composer, haunted by the death of his wife, is given a second chance when he's commissioned to write a symphony for the reopening of a historic concert hall. As he works on his magnum opus, he discovers his wife's death might not have been an accident, and the truth is hidden in the music they created together.",
        "poster_path": "https://image.tmdb.org/t/p/original/2cP9qW1fR8tG3hJ0kL2nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/5xY0zL3vN9bR2tG4hJ6kM7nL8Qx.jpg",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10402, "name": "Music" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2027-02-28",
        "original_language": "en",
        "tagline": "Every note holds a secret. Every silence tells a story.",
        "vote_average": 8.5,
        "vote_count": 35600,
        "runtime": 132,
        "image": "https://img.youtube.com/vi/O7pQqR9mN8sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/O7pQqR9mN8sE"
    },
    {
        "_id": "1400014",
        "id": 1400014,
        "title": "Neon Nights",
        "overview": "In a retro-futuristic 1980s that never was, a private detective with cybernetic enhancements takes on a case to find a missing heiress. His investigation leads him through the neon-drenched streets of a megacity where corporations rule, and the line between human and machine is blurred beyond recognition.",
        "poster_path": "https://image.tmdb.org/t/p/original/3dP0qW2fR9tG4hJ1kL3nM2bX1Zy.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/6xY1zL4vN0bR3tG5hJ7kM8nL9Qx.jpg",
        "genres": [
            { "id": 9648, "name": "Mystery" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 28, "name": "Action" }
        ],
        "casts": dummyCastsData,
        "release_date": "2027-03-15",
        "original_language": "en",
        "tagline": "In this city, everyone has something to hide.",
        "vote_average": 8.0,
        "vote_count": 29800,
        "runtime": 127,
        "image": "https://img.youtube.com/vi/P8qRrS9mN9sE/maxresdefault.jpg",
        "videoUrl": "https://www.youtube.com/embed/P8qRrS9mN9sE"
    }
    // --- Kết thúc bổ sung phim mới ---
]


export const dummyDateTimeData = {
    "2025-07-24": [
        { "time": "2025-07-24T01:00:00.000Z", "showId": "68395b407f6329be2bb45bd1" },
        { "time": "2025-07-24T03:00:00.000Z", "showId": "68395b407f6329be2bb45bd2" },
        { "time": "2025-07-24T05:00:00.000Z", "showId": "68395b407f6329be2bb45bd3" }
    ],
    "2025-07-25": [
        { "time": "2025-07-25T01:00:00.000Z", "showId": "68395b407f6329be2bb45bd4" },
        { "time": "2025-07-25T03:00:00.000Z", "showId": "68395b407f6329be2bb45bd5" },
        { "time": "2025-07-25T05:00:00.000Z", "showId": "68395b407f6329be2bb45bd6" }
    ],
    "2025-07-26": [
        { "time": "2025-07-26T01:00:00.000Z", "showId": "68395b407f6329be2bb45bd7" },
        { "time": "2025-07-26T03:00:00.000Z", "showId": "68395b407f6329be2bb45bd8" },
        { "time": "2025-07-26T05:00:00.000Z", "showId": "68395b407f6329be2bb45bd9" }
    ],
    "2025-07-27": [
        { "time": "2025-07-27T01:00:00.000Z", "showId": "68395b407f6329be2bb45bda" },
        { "time": "2025-07-27T03:00:00.000Z", "showId": "68395b407f6329be2bb45bdb" },
        { "time": "2025-07-27T05:00:00.000Z", "showId": "68395b407f6329be2bb45bdc" }
    ]
}

export const dummyDashboardData = {
    "totalBookings": 14,
    "totalRevenue": 1517,
    "totalUser": 5,
    "activeShows": [
        {
            "_id": "68352363e96d99513e4221a4",
            "movie": dummyShowsData[0],
            "showDateTime": "2025-06-30T02:30:00.000Z",
            "showPrice": 59,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "C1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
        },
        {
            "_id": "6835238fe96d99513e4221a8",
            "movie": dummyShowsData[1],
            "showDateTime": "2025-06-30T15:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221a9",
            "movie": dummyShowsData[2],
            "showDateTime": "2025-06-30T03:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221aa",
            "movie": dummyShowsData[3],
            "showDateTime": "2025-07-15T16:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A4": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
        },
        {
            "_id": "683682072b5989c29fc6dc0d",
            "movie": dummyShowsData[4],
            "showDateTime": "2025-06-05T15:30:00.000Z",
            "showPrice": 49,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
            "__v": 0
        },
        {
            "_id": "68380044686d454f2116b39a",
            "movie": dummyShowsData[5],
            "showDateTime": "2025-06-20T16:00:00.000Z",
            "showPrice": 79,
            "occupiedSeats": {
                "A1": "user_2xl7eCSUHddibk5lRxfOtw9RMwX",
                "A2": "user_2xl7eCSUHddibk5lRxfOtw9RMwX"
            }
        }
    ]
}


export const dummyBookingData = [
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 98,
        "bookedSeats": ["D1", "D2"],
        "isPaid": false,
    },
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 49,
        "bookedSeats": ["A1"],
        "isPaid": true,
    },
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 147,
        "bookedSeats": ["A1", "A2","A3"],
        "isPaid": true,
    },
]