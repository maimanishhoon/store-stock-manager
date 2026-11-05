package com.diwali.shop.config;

import com.diwali.shop.entity.*;
import com.diwali.shop.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository,
                           InventoryTransactionRepository transactionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        initCategories();
        initProductsAndInventory();
    }

    private void initUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("banwarilal321"),
                    "Shop Counter Admin",
                    Role.ADMIN
            );
            userRepository.save(admin);
            log.info("Initialized default ADMIN user: admin / banwarilal321");
        }

        if (!userRepository.existsByUsername("packer")) {
            User packer = new User(
                    "packer",
                    passwordEncoder.encode("banwarilal"),
                    "Ramesh (Packing Team)",
                    Role.PACKING_STAFF
            );
            userRepository.save(packer);
            log.info("Initialized default PACKING_STAFF user: packer / banwarilal");
        }
    }

    private void initCategories() {
        String[][] categories = {
                {"Ground Fireworks", "Spinners, ground chakkars and rotating wheels (inventory record only)"},
                {"Sparklers", "Sparkling wire sticks, color sparklers, electric sparklers"},
                {"Flower Pots", "Traditional anars, fountain pots and color flower pots"},
                {"Decorative Lights", "LED string lights, fairy lights, rice lights for Diwali home decoration"},
                {"Diwali Decorations", "Traditional clay diyas, brass lamps, rangoli colors and stencils"},
                {"Gift Items", "Diwali festive gift boxes, dry fruit hampers, sweets packs"},
                {"Other Products", "Safety matchboxes, incense sticks, sparkler holders"}
        };

        for (String[] cat : categories) {
            if (!categoryRepository.existsByName(cat[0])) {
                categoryRepository.save(new Category(cat[0], cat[1]));
            }
        }
    }

    private void initProductsAndInventory() {
        if (productRepository.count() > 0) {
            return;
        }

        Category catGround = categoryRepository.findByName("Ground Fireworks").orElse(null);
        Category catSparkler = categoryRepository.findByName("Sparklers").orElse(null);
        Category catFlowerPot = categoryRepository.findByName("Flower Pots").orElse(null);
        Category catLights = categoryRepository.findByName("Decorative Lights").orElse(null);
        Category catDeco = categoryRepository.findByName("Diwali Decorations").orElse(null);
        Category catGift = categoryRepository.findByName("Gift Items").orElse(null);
        Category catOther = categoryRepository.findByName("Other Products").orElse(null);

        Object[][] productData = {
                {
                        "Deluxe Ground Chakkar (10 Pcs)", "DW-CHK-01", catGround,
                        "Premium spinning ground wheels with bright silver spark circle.",
                        "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("120.00"), new BigDecimal("220.00"), DiscountType.PERCENTAGE, new BigDecimal("10.00"),
                        45, 10
                },
                {
                        "Standard Flower Pots Anar (5 Pcs)", "DW-FLW-01", catFlowerPot,
                        "Golden fountain flower pot with high showering sparks.",
                        "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("150.00"), new BigDecimal("260.00"), DiscountType.NONE, BigDecimal.ZERO,
                        30, 8
                },
                {
                        "Electric Sparklers 15cm (10 Pcs)", "DW-SPK-01", catSparkler,
                        "Safe bright electric sparks, 15cm long wire for family celebration.",
                        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("40.00"), new BigDecimal("80.00"), DiscountType.NONE, BigDecimal.ZERO,
                        80, 15
                },
                {
                        "Color Sparklers 30cm Giant (5 Pcs)", "DW-SPK-02", catSparkler,
                        "Multi-color sparkling long sticks with green, red and gold sparks.",
                        "https://images.unsplash.com/photo-1576400883215-7083980b619f?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("80.00"), new BigDecimal("150.00"), DiscountType.FIXED, new BigDecimal("20.00"),
                        18, 10
                },
                {
                        "10m Warm White LED String Fairy Lights", "DW-LGT-01", catLights,
                        "Copper wire warm white fairy lights with 8 flashing modes and adapter.",
                        "https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("90.00"), new BigDecimal("199.00"), DiscountType.PERCENTAGE, new BigDecimal("15.00"),
                        60, 12
                },
                {
                        "Multicolor Rice Lights 15m", "DW-LGT-02", catLights,
                        "Heavy duty waterproof multicolor string light for balcony & veranda.",
                        "https://images.unsplash.com/photo-1545649174-8b010c284725?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("110.00"), new BigDecimal("240.00"), DiscountType.NONE, BigDecimal.ZERO,
                        4, 10 // Low stock on purpose!
                },
                {
                        "Handmade Terracotta Clay Diyas (Pack of 12)", "DW-DEC-01", catDeco,
                        "Traditional handmade clay diyas for Diwali pooja and doorstep lighting.",
                        "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("50.00"), new BigDecimal("120.00"), DiscountType.FIXED, new BigDecimal("30.00"),
                        120, 20
                },
                {
                        "Royal Brass Pooja Diya (Pair)", "DW-DEC-02", catDeco,
                        "Pure polished brass ethnic peacock design traditional oil lamps.",
                        "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("350.00"), new BigDecimal("599.00"), DiscountType.NONE, BigDecimal.ZERO,
                        12, 5
                },
                {
                        "Premium Dry Fruits Diwali Gift Box (500g)", "DW-GFT-01", catGift,
                        "Assorted cashews, almonds, pistachios and raisins in golden festive box.",
                        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("420.00"), new BigDecimal("750.00"), DiscountType.PERCENTAGE, new BigDecimal("10.00"),
                        25, 8
                },
                {
                        "Festive Sweet & Diya Gift Hamper", "DW-GFT-02", catGift,
                        "Includes 250g Kaju Katli, 2 decorated clay diyas and festive greeting card.",
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("250.00"), new BigDecimal("450.00"), DiscountType.NONE, BigDecimal.ZERO,
                        2, 6 // Low stock
                },
                {
                        "Diwali Safety Matchbox Bundle (Pack of 10)", "DW-OTH-01", catOther,
                        "Extra-long safety wooden matchsticks for safely lighting fireworks & diyas.",
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
                        new BigDecimal("25.00"), new BigDecimal("50.00"), DiscountType.NONE, BigDecimal.ZERO,
                        200, 25
                }
        };

        for (Object[] item : productData) {
            Product p = new Product();
            p.setName((String) item[0]);
            p.setProductCode((String) item[1]);
            p.setCategory((Category) item[2]);
            p.setDescription((String) item[3]);
            p.setImageUrl((String) item[4]);
            p.setPurchasePrice((BigDecimal) item[5]);
            p.setSellingPrice((BigDecimal) item[6]);
            p.setDiscountType((DiscountType) item[7]);
            p.setDiscountValue((BigDecimal) item[8]);
            p.setAvailableStock((Integer) item[9]);
            p.setReservedStock(0);
            p.setMinimumStockLevel((Integer) item[10]);
            p.setProductStatus(ProductStatus.ACTIVE);

            Product saved = productRepository.save(p);

            Inventory inv = new Inventory(saved, saved.getAvailableStock(), 0, "Warehouse-Section-A");
            inventoryRepository.save(inv);

            InventoryTransaction tx = new InventoryTransaction(
                    saved,
                    TransactionType.ADD_STOCK,
                    saved.getAvailableStock(),
                    0,
                    saved.getAvailableStock(),
                    null,
                    "Initial Season Stock Initialized",
                    "system"
            );
            transactionRepository.save(tx);
        }

        log.info("Initialized default sample products and inventory records.");
    }
}
