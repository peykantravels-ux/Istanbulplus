from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import Category, Product, ProductImage, ProductFile


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductFileInline(admin.TabularInline):
    model = ProductFile
    extra = 1


@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price', 'stock', 'type')
    list_filter = ('type', 'categories')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductFileInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text')


@admin.register(ProductFile)
class ProductFileAdmin(admin.ModelAdmin):
    list_display = ('product', 'file', 'download_limit')
