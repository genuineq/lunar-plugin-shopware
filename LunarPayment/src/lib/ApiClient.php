<?php declare(strict_types=1);

namespace LunarPayment\lib;

use LunarPayment\lib\HttpClient\HttpClientInterface;
use LunarPayment\lib\HttpClient\CurlClient;
use LunarPayment\lib\Endpoint\Apps;
use LunarPayment\lib\Endpoint\Merchants;
use LunarPayment\lib\Endpoint\Transactions;

/**
 *
 */
class ApiClient
{
    /**
     * @var string
     */
    const API_URL = 'https://api.paylike.io';

    /**
     * @var HttpClientInterface
     */
    public $client;

    /**
     * @var string
     */
    private $api_key;

    private $version = '1.0.8';


    /**
     *
     * @param string $api_key
     * @param HttpClientInterface $client
     * @throws Exception\ApiException
     */
    public function __construct($api_key, HttpClientInterface $client = null)
    {
        $this->api_key = $api_key;
        $this->client  = $client ? $client
            : new CurlClient($this->api_key, self::API_URL);
    }

    /**
     * @return string
     */
    public function getApiKey()
    {
        return $this->api_key;
    }


    /**
     * @return Apps
     */
    public function apps()
    {
        return new Apps($this);
    }

    /**
     * @return Merchants
     */
    public function merchants()
    {
        return new Merchants($this);
    }

    /**
     * @return Transactions
     */
    public function transactions()
    {
        return new Transactions($this);
    }

    /**
     * @return string
     */
    public function getVersion(){
        return $this->version;
    }
}
