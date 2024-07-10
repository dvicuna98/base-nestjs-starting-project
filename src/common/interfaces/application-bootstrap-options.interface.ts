export interface ApplicationBootstrapOptions{
    driver?:'orm' | 'in-memory'
    mailing?: 'production' | 'development'
}