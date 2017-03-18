<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCardTagTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('card_tag', function (Blueprint $table) {
       
            $table->integer('card_id')->unsigned()->nullable();
            $table->foreign('card_id')->references('id')
                ->on('cards')->onDelete('cascade');

            $table->integer('tag_id')->unsigned()->nullable();
            $table->foreign('tag_id')->references('id')
                ->on('tags')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('card_tag');
    }
}
