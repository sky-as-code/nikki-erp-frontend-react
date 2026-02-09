# Inventory Product Schema

This document describes the **database schema for managing products, variants, attributes, and categories** in the inventory system.

The schema supports:

* multi-variant products
* dynamic attributes
* multi-language fields
* multi-category products
* flexible product configurations

---

# 1. Product

Table: `inventory_product`

Represents a base product in the inventory.

| Column        | Type         | Description                 |
| ------------- | ------------ | --------------------------- |
| id            | varchar (PK) | Unique product identifier   |
| name          | jsonb        | Localized product name      |
| description   | jsonb        | Localized description       |
| status        | varchar      | active | archived           |
| thumbnail_url | varchar      | Product thumbnail image     |
| unit_id       | varchar (FK) | Reference to inventory_unit |

### Relationships

* One **Product** → many **Variants**
* One **Product** → many **Attributes**
* One **Product** → many **Categories**
* One **Product** → one **Unit**

---

# 2. Variant

Table: `inventory_variant`

Represents a **sellable variation** of a product.

| Column         | Type         | Description             |
| -------------- | ------------ | ----------------------- |
| id             | varchar (PK) | Variant identifier      |
| product_id     | varchar (FK) | Parent product          |
| name           | jsonb        | Variant name            |
| sku            | varchar      | Stock keeping unit      |
| barcode        | varchar      | Barcode                 |
| proposed_price | double       | Suggested selling price |
| image_url      | varchar      | Variant image           |
| status         | varchar      | active | archived       |

### Relationships

* Many **Variants** → one **Product**
* Many **Variants** ↔ many **Attribute Values**

### Example

Product: **T-Shirt**

Variants:

* T-Shirt Red M
* T-Shirt Red L
* T-Shirt Blue M

---

# 3. Attribute Group

Table: `inventory_attribute_group`

Groups related attributes together.

| Column     | Type         |
| ---------- | ------------ |
| id         | varchar (PK) |
| name       | jsonb        |
| index      | bigint       |
| product_id | varchar (FK) |

### Example

* Color Options
* Size Options

---

# 4. Attribute

Table: `inventory_attribute`

Defines a configurable property of a product.

| Column             | Type         | Description                             |
| ------------------ | ------------ | --------------------------------------- |
| id                 | varchar (PK) | Attribute identifier                    |
| code_name          | varchar      | Internal attribute code                 |
| data_type          | varchar      | text | number | bool                    |
| display_name       | jsonb        | Localized label                         |
| is_enum            | boolean      | Whether attribute has predefined values |
| enum_value         | jsonb        | Enum values                             |
| is_required        | boolean      | Required attribute                      |
| sort_index         | bigint       | Display order                           |
| attribute_group_id | varchar (FK) | Attribute group                         |
| product_id         | varchar (FK) | Parent product                          |

### Example

Attribute: **Color**

Enum values:

```
Red
Blue
Black
```

---

# 5. Attribute Value

Table: `inventory_attribute_value`

Represents a **specific value of an attribute**.

| Column        | Type         |
| ------------- | ------------ |
| id            | varchar (PK) |
| attribute_id  | varchar (FK) |
| value_text    | jsonb        |
| value_number  | double       |
| value_bool    | boolean      |
| value_ref     | varchar      |
| variant_count | bigint       |

### Example Values

Color:

* Red
* Blue

Size:

* S
* M
* L

---

# 6. Variant Attribute Mapping

Table: `variant_attribute_value_rel`

Connects **variants** with **attribute values**.

| Column             | Type         |
| ------------------ | ------------ |
| variant_id         | varchar (FK) |
| attribute_value_id | varchar (FK) |

### Example

Variant: **T-Shirt Red M**

```
Color = Red
Size = M
```

---

# 7. Product Category

Table: `inventory_product_category`

Represents product classification.

| Column | Type         |
| ------ | ------------ |
| id     | varchar (PK) |
| name   | jsonb        |
| org_id | varchar      |

### Examples

* Clothing
* Electronics
* Accessories

---

# 8. Product Category Mapping

Table: `product_category_rel`

Many-to-many relationship between **products** and **categories**.

| Column              |
| ------------------- |
| product_id          |
| product_category_id |

Relationship:

* Many **Products** ↔ many **Categories**

---

# 9. Units

Products can use measurement units.

### Examples

* Piece
* Box
* Kg

---

## Unit

Table: `inventory_unit`

| Column      |
| ----------- |
| id          |
| name        |
| symbol      |
| category_id |

---

## Unit Category

Table: `inventory_unit_category`

| Column |
| ------ |
| id     |
| name   |

### Example Unit Categories

* Quantity
* Weight
* Volume

---

# 10. Key Relationships Overview

```
Product
 ├── Variants
 ├── Attributes
 ├── Categories
 └── Unit

Variant
 └── Attribute Values

Attribute
 └── Attribute Values
```

---

# 11. Variant Generation Example

Product:

```
T-Shirt
```

Attributes:

```
Color → Red, Blue
Size  → S, M, L
```

Generated variants:

```
Red S
Red M
Red L
Blue S
Blue M
Blue L
```

---

# 12. Design Goals

This schema allows:

* flexible product configuration
* scalable variant generation
* dynamic product attributes
* multi-language support using `jsonb`
* multi-category product classification

---

# 13. Notes

* `jsonb` fields are used for **localization (multi-language support)**.
* Many-to-many relationships are implemented through **relation tables**.
* Attribute values are **reusable across variants**.
