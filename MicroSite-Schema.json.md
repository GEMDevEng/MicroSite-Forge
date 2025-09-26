{
  "schemas": {
    "public": {
      "tables": {
        "communications": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": "uuid_generate_v4()"
            },
            "lead_id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "type": {
              "ts_type": "'email' | 'sms' | 'call' | 'note'",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "direction": {
              "ts_type": "'inbound' | 'outbound'",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "content": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "status": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "message_id": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "metadata": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "communications_lead_id_fkey",
              "columns": ["lead_id"],
              "referenced_schema": "public",
              "referenced_table": "leads",
              "referenced_columns": ["id"],
              "is_one_to_one": false
            }
          ]
        },
        "invoices": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": "uuid_generate_v4()"
            },
            "user_id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "stripe_invoice_id": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "amount": {
              "ts_type": "number",
              "pg_type": "numeric",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "currency": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "status": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            },
            "updated_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "invoices_user_id_fkey",
              "columns": ["user_id"],
              "referenced_schema": "public",
              "referenced_table": "users",
              "referenced_columns": ["id"],
              "is_one_to_one": false
            }
          ]
        },
        "jobs": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": "uuid_generate_v4()"
            },
            "user_id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "type": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "status": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "data": {
              "ts_type": "Json",
              "pg_type": "jsonb",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "result": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "error": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            },
            "updated_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "jobs_user_id_fkey",
              "columns": ["user_id"],
              "referenced_schema": "public",
              "referenced_table": "users",
              "referenced_columns": ["id"],
              "is_one_to_one": false
            }
          ]
        },
        "leads": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": "uuid_generate_v4()"
            },
            "site_id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "name": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "email": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "phone": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "message": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "source": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "status": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "score_data": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "contact_info": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "tags": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "assigned_to": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "follow_up_date": {
              "ts_type": "string | null",
              "pg_type": "timestamptz",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "marketing_campaign": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "enriched_at": {
              "ts_type": "string | null",
              "pg_type": "timestamptz",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            },
            "updated_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "leads_site_id_fkey",
              "columns": ["site_id"],
              "referenced_schema": "public",
              "referenced_table": "sites",
              "referenced_columns": ["id"],
              "is_one_to_one": false
            }
          ]
        },
        "sites": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": "uuid_generate_v4()"
            },
            "user_id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "name": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "domain": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "status": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "github_repo": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "netlify_url": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "leads_count": {
              "ts_type": "number | null",
              "pg_type": "bigint",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            },
            "updated_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "sites_user_id_fkey",
              "columns": ["user_id"],
              "referenced_schema": "public",
              "referenced_table": "users",
              "referenced_columns": ["id"],
              "is_one_to_one": false
            }
          ]
        },
        "users": {
          "columns": {
            "id": {
              "ts_type": "string",
              "pg_type": "uuid",
              "is_nullable": false,
              "is_primary": true,
              "default_value": null
            },
            "email": {
              "ts_type": "string",
              "pg_type": "text",
              "is_nullable": false,
              "is_primary": false,
              "default_value": null
            },
            "stripe_id": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "twilio_sid": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "preferred_gateway": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "gateway_credentials": {
              "ts_type": "Json | null",
              "pg_type": "jsonb",
              "is_nullable": true,
              "is_primary": false,
              "default_value": null
            },
            "created_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            },
            "updated_at": {
              "ts_type": "string",
              "pg_type": "timestamptz",
              "is_nullable": false,
              "is_primary": false,
              "default_value": "now()"
            }
          },
          "relationships": [
            {
              "foreign_key_name": "users_id_fkey",
              "columns": ["id"],
              "referenced_schema": "auth",
              "referenced_table": "users",
              "referenced_columns": ["id"],
              "is_one_to_one": true
            }
          ]
        }
      },
      "views": {
        "user_sites_stats": {
          "columns": {
            "user_id": {
              "ts_type": "string | null",
              "pg_type": "uuid",
              "is_nullable": true
            },
            "email": {
              "ts_type": "string | null",
              "pg_type": "text",
              "is_nullable": true
            },
            "sites_count": {
              "ts_type": "number | null",
              "pg_type": "bigint",
              "is_nullable": true
            },
            "total_leads_count": {
              "ts_type": "number | null",
              "pg_type": "bigint",
              "is_nullable": true
            },
            "live_sites_count": {
              "ts_type": "number | null",
              "pg_type": "bigint",
              "is_nullable": true
            }
          },
          "relationships": []
        }
      },
      "functions": {
        "get_user_total_leads": {
          "args": {
            "user_uuid": {
              "ts_type": "string",
              "pg_type": "uuid"
            }
          },
          "returns": {
            "ts_type": "number",
            "pg_type": "bigint"
          }
        }
      },
      "enums": {},
      "composite_types": {}
    }
  }
}