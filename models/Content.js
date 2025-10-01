const fs = require('fs-extra');
const path = require('path');

class Content {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/content.json');
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.ensureDir(path.dirname(this.dataPath));
            const exists = await fs.pathExists(this.dataPath);
            if (!exists) {
                // Initialize with your existing movie data
                const defaultContent = [
                    {
                        id: 1,
                        title: "House",
                        year: 2011,
                        genre: "Medical, Drama",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaQHOcdLduCCDQnC_Q9s6jcc_Yg50dw8wEd4jxy33FQrkfeRk1xDuBLg4QyOx0QDJAFMPhhh_32qkBaAOD9RDpY3x6BsUW9R5n4.webp?r=8eb"
                    },
                    {
                        id: 2,
                        title: "Love Is Blind",
                        year: 2025,
                        genre: "Romantic, Reality",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABdxIlxoppRCW0BN-_Bgj8o8poFsdrQCv2qjm_R8O52brppK99nKTT3U789ZhrQ2oEBo3xxqG7x8zUZI8LyPg2gQ5tmrggwWddgvE9wa7b_uEGo0DnR7JJX5Do8ahGyEJZJUh04AbD1lq5jlxB27sqBhIgXZCGA4F8ts9UJjfWPuUEdpsZabJVOewKXarudMp0Tgo46Ir02T09etCsUqNlUBHq-cF178v7NI.jpg?r=83d"
                    },
                    {
                        id: 3,
                        title: "Brooklyn Nine-Nine",
                        year: 2021,
                        genre: "Sitcom, Comedy, Crime",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABXswStJF6erS2MFeQovOiQpEioWFDoacFevkcDAz3i3zUrg_4-WEN3mljlIqseGqoo5hiL8w1ngOIyyM7SVrcmsYuWqnlZHSLoM.webp?r=c02"
                    },
                    {
                        id: 4,
                        title: "Gossip Girl",
                        year: 2012,
                        genre: "Drama, Teens",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABRSSySpczVbDRN7GtCwocOyxNDF4JjV-4g360CnQuRuWyU-KY-AE_iz18GdAtnA-25hq-6vkIfIbcz4E-q-CakrfT75HVl25xtM.webp?r=0f8"
                    },
                    {
                        id: 5,
                        title: "BoJack Horseman",
                        year: 2020,
                        genre: "Adult Animation, Sitcom, Comedy",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABcAQLVkzLmfrPzpdUS0kLseKTK13KJx6YWMYVZ8YP6iOPqTOcANJF9hvFyY1bkutBKMcrUIqrPbh5DHWKTPoc6ugD0bsbw0Iv-uuSzMxldE_pLi7jQgPirAJ62DbneNRA2-P.jpg?r=e20"
                    },
                    {
                        id: 6,
                        title: "Lucifer",
                        year: 2021,
                        genre: "Drama, Crime",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABSgixNYwX5NJ0R8A0fckxyhhB7BwU47ksY-5-MwBOz_4CyaNPsl6B8_3vjPCge3HqyWEjhIZ8VVihjg0E99da-c3WX8npPcFQTJPBqcDtSPssgqTxfe4NpQ4AFtGVwwX7qWr.jpg?r=1c3"
                    },
                    {
                        id: 7,
                        title: "Orange Is The New Black",
                        year: 2019,
                        genre: "Drama, Comedy",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABQnbVuaqnsAnKE3AhXOI0UZjrtGUVXfH5JqnHDBpmkdUTszTaKvyBPffs8Eh6m4arC1CsnBnfik-38A5BBjTCUVju-BWxcCJtWrbVPbuPQ_QHoFe8-Jb8oy-OWRLIt02g1b3.jpg?r=f1e"
                    },
                    {
                        id: 8,
                        title: "House of Cards",
                        year: 2018,
                        genre: "Political, Drama",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABf0rej3QuIII2RVsK9DkaY_8WjvPQ_-oUezv14Rn3H6DUR-DmtTq5qE8c3Cx7SuRzeGtf2iigC5dN9ABupPpM22lQRYrsbJTDQlfYf2wGTHITM_zZY8dV2SdYaPMm9Lnqfy0.jpg?r=c6b"
                    },
                    {
                        id: 9,
                        title: "Gilmore Girls",
                        year: 2006,
                        genre: "Romantic, Drama, Teens",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABePjVUmTO8X_TvfviqIQLx8ygidrtZM_h4Be9jrS8Agl0O9Az60cf1MZ9kpR9_MsuKKnjBwRYrxEZA3QjcPzKxlq6xXIIhcLDrA.webp?r=cf1"
                    },
                    {
                        id: 10,
                        title: "The Terminal",
                        year: 2004,
                        genre: "Romantic Comedy, Drama, Comedy",
                        type: "Movie",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABZx0I09CYvyvoubjdi6C6AUIB1FDVO11ZqSareCV07p_dVO_6X4ULYY36BihuFUIYW9IDFIfmit70mt67RroKo8As2mCsnYWtts.webp?r=dcc"
                    },
                    {
                        id: 11,
                        title: "Big Mouth",
                        year: 2025,
                        genre: "Adult Animation, Sitcom",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABWDkHvVs2ltfdUcqKxbv_JjGtie3s64UdR2KDL_6NEcAktSXJ-p51nikN9RgyuMJAmkspUX97bxN7eecU3DnRxo9e296uwb_uR8PkTNjEqoeoAM89oa_lHC_3RrAOm_wn9c6E4ddREAJtjEKCI6EbdsX_xW4fKQOx6jO49fSroZIi9aIj9vGqmQqkLftXEhjVL5A9jAaw3X9UtLzzbvvuC_74DVEtNnxw04.jpg?r=d95"
                    },
                    {
                        id: 12,
                        title: "Too Hot To Handle",
                        year: 2024,
                        genre: "Reality",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUObsJ5aV9p7OpAMQvlKMTfV_AHZW16-cKXZG8vIa8mFr2rE2a4gdioOmrPltLhs90M05CYNqLiTG3q3GQ5DtyEfePeUjp31NDhtx3hmqQD4QW7np3n-DD9jd0L31HqBbFrb.jpg?r=a70"
                    },
                    {
                        id: 13,
                        title: "Seinfeld",
                        year: 1997,
                        genre: "Sitcom, Comedy",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABek5Vfqnb2Q6LV1ricFCm6hwTIUx4lM8A0qChb3hBkXrzf0Aqnqm1W55M6-5rM75hGyuhgcjXJIthMkFN70ha85lQuu0AITsaJY.webp?r=a2d"
                    },
                    {
                        id: 14,
                        title: "Money Heist",
                        year: 2021,
                        genre: "Crime, Thriller",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABYQR8keX2salvT6mI4gP7R_0td2Ij-YQEerhrfNYEZ7YK1Y69R4h_vyB5oxyEIST4uvUw749SOsF2JXJ_kfR0mnSMW81hlOCxyl1RAjp6vbzZiESK010TylkUBM_hYb3s2fl.jpg?r=695"
                    },
                    {
                        id: 15,
                        title: "Rick And Morty",
                        year: 2023,
                        genre: "Adult Animation, Sitcom, Sci-fi",
                        type: "Series",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABa5BCf6HoCBQCEQW5JNP301dwSPyJPEXbFicrHodTtnqA1AtzHfQyEfkHWQurDLPdc9Eq4LszcOs9gzzykJ3FvNwjhX2B7KLteY.webp?r=edf"
                    },
                    {
                        id: 16,
                        title: "Dead Poets Society",
                        year: 1989,
                        genre: "Classic, Drama",
                        type: "Movie",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABV8sZMRBQJNC96ozW-VDffV_KoF8A9JWxa7TjOPKZ1PwBPPcgM5C1Bc_IEw43iZBKEIJ2hEGm_ojrmOPffhym0A6XOy9EjLpRFU.webp?r=166"
                    },
                    {
                        id: 17,
                        title: "Good Will Hunting",
                        year: 1997,
                        genre: "Classic, Drama",
                        type: "Movie",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABe3v9snNZV3lusIELrCUksh4Ir4emffAouA4k6scI_hhaL534bKRKghYqIEEX21BNaEBoYzns5nLbQc71C5-fwdsUBQmCvKiBsghNrcmgiQLPrc8ZhDgwOkyMY5DeJRPNgrtPsF89Broy7Os8Dv2GUifu9OUqI2DFto.webp?r=b13"
                    },
                    {
                        id: 18,
                        title: "Mr. & Mrs. Smith",
                        year: 2005,
                        genre: "Romantic Comedy, Crime, Comedy",
                        type: "Movie",
                        likes: 0,
                        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUFS_aJO9WRIF26ysUdwPyeUFykIj3dSyAq44cHdQAsAHCCM6ELjTw2uLcs5cqSYMIgH-MJgNTNglh8bc2fO_53aNdqr9wyCn7g.webp?r=f02"
                    }
                ];
                await fs.writeJson(this.dataPath, defaultContent);
            }
        } catch (error) {
            console.error('Error ensuring content data file:', error);
        }
    }

    async getContent() {
        try {
            return await fs.readJson(this.dataPath);
        } catch (error) {
            console.error('Error reading content:', error);
            return [];
        }
    }

    async saveContent(content) {
        try {
            await fs.writeJson(this.dataPath, content, { spaces: 2 });
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    }

    async findById(id) {
        const content = await this.getContent();
        return content.find(item => item.id === parseInt(id));
    }

    async updateLikes(id, increment = true) {
        const content = await this.getContent();
        const item = content.find(item => item.id === parseInt(id));
        
        if (item) {
            if (increment) {
                item.likes++;
            } else {
                item.likes = Math.max(0, item.likes - 1);
            }
            await this.saveContent(content);
            return item;
        }
        return null;
    }
}

module.exports = Content;