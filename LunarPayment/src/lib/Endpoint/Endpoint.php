<?php declare(strict_types=1);

namespace LunarPayment\lib\Endpoint;

use LunarPayment\lib\ApiClient;

/**
 * Class Endpoint
 */
abstract class Endpoint
{
    /**
     * @var ApiClient
     */
    protected $endpoint;

    /**
     * @param ApiClient $endpoint
     */
    function __construct($endpoint)
    {
        $this->endpoint = $endpoint;
    }
}
