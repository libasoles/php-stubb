<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCardStackTable extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('card_stack', function (Blueprint $table) {

            $table->integer('card_id')->unsigned()->nullable();
            $table->foreign('card_id')->references('id')
                ->on('cards')->onDelete('cascade');

            $table->integer('stack_id')->unsigned()->nullable();
            $table->foreign('stack_id')->references('id')
                ->on('stacks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('card_stack');
    }
}
